"""Deterministic demo trips (TRAVELGENIE_DEMO=1).

Produces a "raw plan" in exactly the shape Gemini returns, so it runs through the
same normalization and streaming-progress code as real plans. Goa uses curated
real places; any other destination gets a clearly labelled sample itinerary.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any, AsyncIterator

from .budget import TIERS, BudgetPlan
from .prompt import sanitize
from .schemas import PlanRequest

DEMO_MODEL = "demo"

PRICE_SCALE = {"budget": 0.6, "moderate": 1.0, "luxury": 1.8, "ultra": 3.0}
PACE_LIMIT = {"relaxed": 4, "balanced": 5, "packed": 7}

# (time, title, description, area, category, cost per person at "moderate", minutes, maps place)
A = tuple[str, str, str, str, str, int, int, str]

GOA_DAYS: list[tuple[str, list[A]]] = [
    ("North Goa cliffs, cafes & forts", [
        ("09:00", "Breakfast at Artjuna Garden Cafe", "Shakshuka and cold brew in a leafy garden courtyard.", "Anjuna", "food", 450, 60, "Artjuna Garden Cafe"),
        ("10:30", "Swim at Ozran Beach (Little Vagator)", "A quieter cove under red cliffs; look for the Shiva face carved in the rock.", "Vagator", "nature", 0, 120, "Ozran Beach"),
        ("13:00", "Lunch at Thalassa", "Greek mezze on a clifftop deck with sweeping sea views.", "Vagator", "food", 1400, 90, "Thalassa Vagator"),
        ("15:30", "Siesta & pool time", "Head back to the hotel to rest through the afternoon heat.", "Vagator", "stay", 0, 90, ""),
        ("17:30", "Sunset at Chapora Fort", "Short climb to the ramparts for the classic sunset over the Chapora river mouth.", "Chapora", "sight", 0, 75, "Chapora Fort"),
        ("20:00", "Dinner at Gunpowder", "South Indian coastal cooking in an old Portuguese house — try the Kerala prawn curry.", "Assagao", "food", 1100, 90, "Gunpowder Assagao"),
        ("22:00", "Live music at Hilltop", "Catch a late set at the long-running open-air venue.", "Vagator", "nightlife", 800, 90, "Hilltop Goa"),
    ]),
    ("Old Goa churches & Panaji's Latin Quarter", [
        ("08:30", "Breakfast at Café Tato", "Goa's favourite bhaji-pav and sweet tea since 1951.", "Panaji", "food", 200, 45, "Cafe Tato"),
        ("10:00", "Basilica of Bom Jesus", "UNESCO-listed baroque basilica holding the relics of St. Francis Xavier.", "Old Goa", "culture", 0, 60, "Basilica of Bom Jesus"),
        ("11:15", "Se Cathedral & Church of St. Francis of Assisi", "Walk across the square to Asia's largest church and the museum next door.", "Old Goa", "culture", 50, 75, "Se Cathedral"),
        ("13:30", "Lunch at Ritz Classic", "Famous fish thali with kingfish recheado and sol kadi.", "Panaji", "food", 600, 75, "Ritz Classic Panaji"),
        ("15:30", "Fontainhas heritage walk", "Wander the Latin Quarter's pastel houses, azulejo tiles and the Chapel of St. Sebastian.", "Fontainhas", "culture", 0, 90, "Fontainhas"),
        ("18:00", "Sunset cruise on the Mandovi", "Hour-long river cruise with Goan folk dances from the Santa Monica jetty.", "Panaji", "sight", 500, 60, "Santa Monica Jetty"),
        ("20:00", "Dinner at Mum's Kitchen", "Heirloom Goan recipes — order the chicken cafreal and bebinca.", "Miramar", "food", 1200, 90, "Mum's Kitchen Miramar"),
    ]),
    ("South Goa: Cabo de Rama & Palolem", [
        ("08:30", "Drive south to Canacona", "Scenic 2-hour drive through villages and paddy fields.", "Canacona", "transit", 0, 120, ""),
        ("10:45", "Cabo de Rama Fort", "Crumbling clifftop fort with a tiny chapel and huge ocean views.", "Canacona", "sight", 0, 75, "Cabo de Rama Fort"),
        ("12:45", "Lunch at Dropadi", "Beachfront seafood on Palolem's crescent bay.", "Palolem", "food", 800, 75, "Dropadi Restaurant Palolem"),
        ("14:30", "Kayaking at Palolem Beach", "Paddle the calm bay towards the rocky northern end.", "Palolem", "adventure", 600, 90, "Palolem Beach"),
        ("16:30", "Boat to Butterfly Beach", "Small-boat trip to a hidden cove, often with dolphins on the way.", "Palolem", "nature", 600, 120, "Butterfly Beach Goa"),
        ("20:00", "Dinner at Martin's Corner", "Goan classics like crab xec xec on the drive back north.", "Betalbatim", "food", 1100, 90, "Martin's Corner Betalbatim"),
    ]),
    ("Spice farms, temples & waterfalls", [
        ("08:00", "Dudhsagar Falls jeep safari", "Shared jeep through Bhagwan Mahaveer Sanctuary to the four-tiered falls (closed in monsoon).", "Mollem", "adventure", 900, 210, "Dudhsagar Falls"),
        ("12:45", "Lunch & tour at Sahakari Spice Farm", "Guided walk through pepper, cardamom and cashew groves, then a buffet on banana leaf.", "Ponda", "food", 700, 120, "Sahakari Spice Farm"),
        ("15:15", "Shri Mangueshi Temple", "Elegant 18th-century temple with a seven-storey lamp tower.", "Mangeshi", "culture", 0, 45, "Shri Mangueshi Temple"),
        ("17:30", "Sunset at Miramar Beach", "Easy-going city beach where the Mandovi meets the sea.", "Miramar", "nature", 0, 60, "Miramar Beach"),
        ("19:45", "Dinner at Fisherman's Wharf", "Riverside Goan seafood with live music.", "Panaji", "food", 1100, 90, "Fisherman's Wharf Panjim"),
    ]),
]

GOA_ARRIVAL: list[A] = [
    ("14:00", "Late lunch at Britto's", "Beach-shack institution — prawn curry rice and a famous dessert counter.", "Baga", "food", 900, 75, "Britto's Baga"),
    ("16:00", "Fort Aguada & lighthouse", "17th-century Portuguese fort with views over Sinquerim Beach.", "Candolim", "sight", 50, 75, "Fort Aguada"),
    ("18:00", "Sunset at Sinquerim Beach", "Wide, clean beach for a first Goan sunset.", "Candolim", "nature", 0, 60, "Sinquerim Beach"),
    ("20:00", "Dinner at Fisherman's Wharf", "Goan seafood thali on the Sal river deck.", "Cavelossim", "food", 1100, 90, "Fisherman's Wharf Cavelossim"),
]

GOA_STAY_LIST = [
    ("The Hosteller Goa, Vagator", "Hostel", "Vagator", "Walk to Ozran and Vagator beaches", 4.3),
    ("Fairfield by Marriott Goa Anjuna", "Hotel", "Anjuna", "Reliable rooms, pool and breakfast included", 4.3),
    ("Casa Anjuna", "Heritage boutique hotel", "Anjuna", "200-year-old mansion with a garden pool", 4.3),
    ("W Goa", "Resort", "Vagator", "Cliffside villas overlooking Vagator beach", 4.6),
    ("Taj Fort Aguada Resort & Spa", "Resort", "Candolim", "Clifftop resort beside the old fort", 4.6),
    ("Taj Exotica Resort & Spa", "Beach resort", "Benaulim", "Mediterranean villas on a private beach", 4.7),
    ("Ahilya by the Sea", "Luxury villa hotel", "Nerul", "Nine-room hideaway on the Coco Beach headland", 4.8),
]

GOA_TIPS = [
    "Rent a scooter (₹400–600/day) for North Goa — carry your licence; helmets are checked often.",
    "Use the GoaMiles app for metered cabs; app-based Uber/Ola don't operate in most of Goa.",
    "Most beach shacks close from June to September, and Dudhsagar jeep safaris pause in the monsoon.",
    "Wear covered shoulders and knees in Old Goa's churches and temples.",
    "Carry cash for shacks and markets — card machines and UPI are patchy in smaller villages.",
]

GENERIC_DAYS: list[tuple[str, list[A]]] = [
    ("Old town & local flavours", [
        ("08:30", "Breakfast at a well-reviewed local cafe", "Start with a regional breakfast speciality.", "Old Town", "food", 300, 60, ""),
        ("10:00", "Guided heritage walk", "Explore the historic core with a local guide.", "Old Town", "culture", 400, 120, ""),
        ("12:30", "Lunch at a classic local restaurant", "Try the destination's signature dishes.", "Old Town", "food", 600, 75, ""),
        ("14:30", "Main museum or landmark", "Spend the afternoon at the city's best-known sight.", "Centre", "sight", 300, 120, ""),
        ("17:30", "Sunset viewpoint", "Catch the golden hour from a popular viewpoint.", "Centre", "nature", 0, 60, ""),
        ("20:00", "Dinner at a popular restaurant", "Relaxed dinner close to your stay.", "Centre", "food", 900, 90, ""),
    ]),
    ("Markets, crafts & food trail", [
        ("09:00", "Breakfast near the main market", "Fuel up before the market opens.", "Market", "food", 250, 45, ""),
        ("10:00", "Main bazaar & craft shops", "Browse local crafts, textiles and spices.", "Market", "shopping", 1000, 150, ""),
        ("13:00", "Street-food lunch trail", "Taste a few local favourites on a short food walk.", "Market", "food", 500, 90, ""),
        ("15:30", "Garden or lakeside walk", "Slow down with an easy walk outdoors.", "Outskirts", "nature", 100, 90, ""),
        ("19:30", "Dinner with local music", "Regional cuisine with a cultural performance.", "Centre", "food", 1000, 120, ""),
    ]),
]

GENERIC_ARRIVAL: list[A] = [
    ("14:00", "Late lunch near your stay", "Settle in with an easy meal close to the hotel.", "Centre", "food", 500, 60, ""),
    ("16:00", "Orientation walk", "Get your bearings around the neighbourhood.", "Centre", "sight", 0, 90, ""),
    ("19:30", "Welcome dinner", "A relaxed first dinner.", "Centre", "food", 800, 90, ""),
]

GENERIC_TIPS = [
    "This is TravelGenie demo data — set GEMINI_API_KEY to generate a real, place-by-place plan.",
    "Book popular sights a day ahead in peak season to skip queues.",
    "Keep some cash for small shops and autos; UPI works almost everywhere else.",
]


def _is_goa(destination: str) -> bool:
    return "goa" in destination.lower()


def _activity(a: A, travelers: int, scale: float, destination: str) -> dict[str, Any]:
    time, title, description, area, category, cost, minutes, place = a
    total = int(round(cost * travelers * scale / 50.0)) * 50
    return {
        "time": time, "title": title, "description": description, "area": area, "category": category,
        "cost": total, "duration_minutes": minutes,
        "maps_query": f"{place}, {area}, {destination}" if place else "",
    }


def _minutes(hhmm: str) -> int:
    h, m = map(int, hhmm.split(":"))
    return h * 60 + m


def _hhmm(total: int) -> str:
    total = max(0, min(total, 23 * 60 + 59))
    return f"{total // 60:02d}:{total % 60:02d}"


def build_raw_plan(req: PlanRequest, budget: BudgetPlan) -> dict[str, Any]:
    destination = sanitize(req.destination) or "your destination"
    origin = sanitize(req.origin) if req.origin else ""
    goa = _is_goa(destination)
    scale = PRICE_SCALE.get(req.budget, 1.0)
    travelers = req.travelers
    pool = GOA_DAYS if goa else GENERIC_DAYS
    limit = PACE_LIMIT[req.pace]

    days: list[dict[str, Any]] = []
    if req.plan_mode == "hours":
        count = max(2, min(limit, req.duration // 2 + 1))
        start = 16 * 60 if req.mood == "party" else 10 * 60
        acts = []
        for a in pool[0][1][:count]:
            act = _activity(a, travelers, scale, destination)
            act["time"] = _hhmm(start)
            start += act["duration_minutes"] + 30
            acts.append(act)
        days.append({"title": f"{req.duration} hours in {destination}", "activities": acts})
    else:
        for n in range(req.duration):
            title, items = pool[n % len(pool)]
            if n >= len(pool):
                title = f"{title} (at a slower pace)"
            acts = [_activity(a, travelers, scale, destination) for a in items][:limit]
            if n == 0 and req.duration > 1:
                arrival = GOA_ARRIVAL if goa else GENERIC_ARRIVAL
                title = "Arrival & first sunset" if goa else "Arrival & first look"
                acts = [
                    {"time": "11:00", "title": f"Arrive in {destination}" + (f" from {origin}" if origin else ""),
                     "description": "Transfer to your hotel.", "area": "", "category": "transit", "cost": 0,
                     "duration_minutes": 90, "maps_query": ""},
                    {"time": "12:45", "title": "Hotel check-in", "description": "Drop your bags and freshen up.",
                     "area": "", "category": "stay", "cost": 0, "duration_minutes": 45, "maps_query": ""},
                ] + [_activity(a, travelers, scale, destination) for a in arrival][: max(1, limit - 2)]
            if n == req.duration - 1 and req.duration > 1:
                acts = [a for a in acts if _minutes(a["time"]) < 14 * 60][: max(1, limit - 1)]
                acts.append({"time": "15:00", "title": f"Depart {destination}" + (f" for {origin}" if origin else ""),
                             "description": "Check out and head to the airport or station.", "area": "",
                             "category": "transit", "cost": 0, "duration_minutes": 60, "maps_query": ""})
            days.append({"title": title, "activities": acts})

    room = TIERS[req.budget]["room_per_night"]
    if goa:
        ordered = sorted(GOA_STAY_LIST, key=lambda s: abs(GOA_STAY_PRICES[s[0]] - room))[:3]
        stays_src = sorted(ordered, key=lambda s: GOA_STAY_PRICES[s[0]])
        stays = [{"name": n, "type": t, "area": ar, "highlight": h, "price_per_night": GOA_STAY_PRICES[n], "rating": r}
                 for n, t, ar, h, r in stays_src]
    else:
        stays = [
            {"name": f"Budget guesthouse in {destination} (demo)", "type": "Guesthouse", "area": "Centre",
             "highlight": "Simple, clean rooms close to the sights", "price_per_night": int(room * 0.6), "rating": 4.1},
            {"name": f"Boutique hotel in {destination} (demo)", "type": "Boutique hotel", "area": "Old Town",
             "highlight": "Characterful rooms with breakfast", "price_per_night": int(room * 0.9), "rating": 4.4},
            {"name": f"Resort in {destination} (demo)", "type": "Resort", "area": "Outskirts",
             "highlight": "Pool, spa and quiet grounds", "price_per_night": int(room * 1.4), "rating": 4.6},
        ]

    transport = _transport(req, destination, origin, goa)
    tips = GOA_TIPS if goa else GENERIC_TIPS
    unit = "day" if req.plan_mode == "days" else "hour"
    plural = "s" if req.duration != 1 else ""
    return {
        "overview": {
            "title": f"{req.duration} sunny {unit}{plural} in Goa" if goa else f"{req.duration} {unit}{plural} in {destination}",
            "summary": (
                "Cliff-top cafes and forts in the north, baroque churches in Old Goa and quiet coves in the south — "
                "a relaxed mix of beaches, Goan food and heritage. This is a demo itinerary generated without AI."
                if goa else
                f"A sample {req.pace} itinerary for {destination} to preview TravelGenie. "
                "Connect a Gemini API key for real, place-by-place recommendations."
            ),
            "highlights": (["Sunset at Chapora Fort", "Basilica of Bom Jesus", "Fish thali at Ritz Classic", "Kayaking at Palolem"]
                           if goa else ["Heritage walk", "Market & food trail", "Sunset viewpoint"]),
            "vibe": {"relaxing": "chill", "adventure": "active", "romantic": "romance", "cultural": "heritage", "party": "party"}[req.mood],
        },
        "stays": [] if req.plan_mode == "hours" else stays,
        "transport": transport,
        "days": days,
        "tips": tips,
    }


GOA_STAY_PRICES = {
    "The Hosteller Goa, Vagator": 1600,
    "Fairfield by Marriott Goa Anjuna": 4200,
    "Casa Anjuna": 6500,
    "W Goa": 18000,
    "Taj Fort Aguada Resort & Spa": 14000,
    "Taj Exotica Resort & Spa": 32000,
    "Ahilya by the Sea": 45000,
}


def _transport(req: PlanRequest, destination: str, origin: str, goa: bool) -> list[dict[str, Any]]:
    scale = PRICE_SCALE.get(req.budget, 1.0)
    t = req.travelers
    if origin and req.plan_mode == "days":
        options = {
            "flight": {"mode": "flight", "title": f"Non-stop flights, {origin} → {'Goa (GOI / GOX)' if goa else destination}",
                       "details": "IndiGo, Air India and Akasa fly the route daily; book 3–4 weeks ahead for the best fares.",
                       "duration": "2h 30m", "total_cost": int(7000 * t * max(scale, 0.8))},
            "train": {"mode": "train", "title": f"Overnight train, {origin} → {'Madgaon (MAO)' if goa else destination}",
                      "details": "3AC sleeper berths; book on IRCTC as soon as the 60-day window opens.",
                      "duration": "12h–26h", "total_cost": int(3200 * t * max(scale, 0.8))},
            "bus": {"mode": "bus", "title": f"AC sleeper bus, {origin} → {destination}",
                    "details": "Book on redBus; Volvo/Scania sleepers are the most comfortable.",
                    "duration": "12h+", "total_cost": int(2400 * t)},
            "car": {"mode": "car", "title": f"Drive from {origin}",
                    "details": "Self-drive or a hired car with driver; budget for tolls and fuel both ways.",
                    "duration": "Varies", "total_cost": int(9000 * max(1, (t + 3) // 4) * max(scale, 1.0))},
        }
        order = [req.transport] + [m for m in ("flight", "train", "bus", "car") if m != req.transport]
        return [options[m] for m in order]
    days = req.duration if req.plan_mode == "days" else 1
    share = 1.0 if req.plan_mode == "days" else min(1.0, req.duration / 8)
    return [
        {"mode": "scooter", "title": "Scooter rental" + (" (North Goa)" if goa else ""),
         "details": "The easiest way to hop between beaches and cafes; ₹400–600 per day plus fuel.",
         "duration": "Flexible", "total_cost": int(600 * max(1, (t + 1) // 2) * days * share)},
        {"mode": "cab", "title": "GoaMiles app cabs" if goa else "App cabs (Uber / Ola)",
         "details": "Metered fares, AC cars, book from the app for each leg.",
         "duration": "Door to door", "total_cost": int(1500 * max(1, (t + 3) // 4) * days * share)},
        {"mode": "car", "title": "Private car with driver",
         "details": "Full-day hire covers 8 hours / 80 km; best for families and long day trips.",
         "duration": "Full day", "total_cost": int(3000 * max(1, (t + 3) // 4) * days * share * max(scale, 1.0))},
    ]


async def stream_raw_plan(req: PlanRequest, budget: BudgetPlan, *, chunk_size: int = 160,
                          total_seconds: float = 4.5, thinking_seconds: float = 1.0) -> AsyncIterator[str]:
    """Yield the demo plan's JSON in small chunks with delays, like a real model stream."""
    text = json.dumps(build_raw_plan(req, budget), ensure_ascii=False, indent=1)
    chunks = [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]
    await asyncio.sleep(thinking_seconds)
    delay = total_seconds / max(1, len(chunks))
    for chunk in chunks:
        yield chunk
        await asyncio.sleep(delay)
