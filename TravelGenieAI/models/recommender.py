# trip_planner_ai/models/recommender.py

import random
import math

import joblib

from settings import MODEL_PATH

def _get_budget_total(budget_str):
    budget_map = {
        "Budget Friendly": 15000,
        "Moderate": 40000,
        "Luxury": 100000,
        "Ultra Luxury": 300000
    }
    return budget_map.get(budget_str, 30000)


def _build_scene(mood):
    scene_types = {
        "Relaxing": {"category": "Chill", "icon": "Sun"},
        "Adventure": {"category": "Active", "icon": "Mountain"},
        "Party": {"category": "Party", "icon": "Music"},
        "Cultural": {"category": "History", "icon": "Landmark"},
        "Romantic": {"category": "Romance", "icon": "Sun"},
    }
    return scene_types.get(mood, {"category": "Balanced", "icon": "Map"})


def _density_from_pace_and_mood(mood, pace):
    if pace == "Chill":
        return "Relaxed"
    if pace == "Fast Paced":
        return "Packed"

    density_map = {
        "Relaxing": "Relaxed",
        "Adventure": "Packed",
        "Party": "Packed",
        "Cultural": "Moderate",
        "Romantic": "Moderate",
    }
    return density_map.get(mood, "Moderate")


def _format_time(hour_float):
    hour = int(hour_float) % 24
    minutes = int(round((hour_float - int(hour_float)) * 60))
    return f"{hour:02d}:{minutes:02d}"


def _mood_activity_templates():
    return {
        "Relaxing": [
            ("Sunrise walk", "Scenic boardwalk", 0),
            ("Brunch", "Slow cafe experience", 450),
            ("Spa break", "Ayurvedic wellness session", 1600),
            ("Sunset point", "Golden-hour photos", 200),
            ("Beach dinner", "Seafood and live acoustic music", 1200),
        ],
        "Adventure": [
            ("Trail hike", "Guided trek to viewpoint", 900),
            ("Zipline session", "Short high-adrenaline run", 1500),
            ("ATV trail", "Off-road terrain loop", 1800),
            ("Street-food stop", "Energy refill", 350),
            ("Night market", "Late walk and local shopping", 600),
        ],
        "Party": [
            ("Cafe brunch", "Late morning recovery meal", 500),
            ("Pool hangout", "DJ lounge and mocktails", 1400),
            ("Sunset pre-party", "Rooftop set", 1000),
            ("Club entry", "Prime-time music venue", 2200),
            ("Post-midnight snacks", "24x7 diner stop", 400),
        ],
        "Cultural": [
            ("Heritage walk", "Guided old-town route", 500),
            ("Museum tour", "Local history gallery", 350),
            ("Craft workshop", "Traditional art session", 800),
            ("Local thali", "Regional cuisine lunch", 450),
            ("Evening performance", "Classical music or folk dance", 950),
        ],
        "Romantic": [
            ("Garden stroll", "Quiet morning in botanical park", 100),
            ("Couple brunch", "Riverside cafe", 900),
            ("Boat ride", "Private sunset cruise", 1800),
            ("Photo session", "Scenic couple spots", 700),
            ("Candlelight dinner", "Curated chef menu", 2500),
        ],
    }


def _build_stays(stay_budget, nights, plan_mode):
    if plan_mode == "Hour-wise" and nights == 0:
        options = [
            {"name": "Airport Lounge Pod", "type": "Transit Lounge", "amenity": "Shower + Nap Pod", "cost": 1800, "score": 8.2},
            {"name": "City Day Room", "type": "Day Use Hotel", "amenity": "Flexible check-in", "cost": 2600, "score": 8.7},
            {"name": "Co-working Lounge", "type": "Hybrid Rest Space", "amenity": "Lockers + Wi-Fi", "cost": 1200, "score": 7.9},
        ]
        stays_result = []
        for option in options:
            stays_result.append({
                "name": option["name"],
                "type": option["type"],
                "amenity": option["amenity"],
                "total_cost": option["cost"],
                "is_over_budget": option["cost"] > stay_budget,
                "visual_cue": "red_shadow" if option["cost"] > stay_budget else "none",
            })
        return stays_result

    avg_night_cost = max(stay_budget / max(nights, 1), 1500)
    stay_options = [
        {"name": "Seaside Resort", "type": "Resort", "amenity": "Beach View", "cost_per_night": avg_night_cost * 1.15, "score": 9.2},
        {"name": "City Center Hotel", "type": "Hotel", "amenity": "Central Location", "cost_per_night": avg_night_cost * 0.95, "score": 8.6},
        {"name": "Cozy Homestay", "type": "Homestay", "amenity": "Local Host Experience", "cost_per_night": avg_night_cost * 0.7, "score": 8.9},
    ]

    stays_result = []
    for stay in stay_options:
        total_cost = stay["cost_per_night"] * max(nights, 1)
        is_over_budget = total_cost > stay_budget
        stays_result.append({
            "name": stay["name"],
            "type": stay["type"],
            "amenity": stay["amenity"],
            "total_cost": int(total_cost),
            "is_over_budget": is_over_budget,
            "visual_cue": "red_shadow" if is_over_budget else "none"
        })
    return stays_result


def _build_transport(transport_budget, duration_days, selected_transport):
    base_costs = {
        "Flight": 3200,
        "Train": 1400,
        "Bus": 900,
        "Car Rental": 2200,
        "Taxi": 1800,
    }
    options = ["Flight", "Train", "Bus", "Car Rental", "Taxi"]
    transport_result = []

    for mode in options:
        multiplier = 1.0 if mode == selected_transport else 1.12
        estimated_total = int(base_costs.get(mode, 1600) * max(duration_days, 1) * multiplier)
        is_over_budget = estimated_total > transport_budget
        transport_result.append({
            "mode": mode,
            "estimated_total": estimated_total,
            "is_over_budget": is_over_budget,
            "visual_cue": "red_shadow" if is_over_budget else "none"
        })

    transport_result.sort(key=lambda item: item["estimated_total"])
    return transport_result


def _build_daywise_itinerary(days, mood, density, activity_budget, location_name):
    templates = _mood_activity_templates().get(mood, _mood_activity_templates()["Relaxing"])
    slots_by_density = {
        "Relaxed": [8.0, 11.0, 15.5, 19.0],
        "Moderate": [8.0, 10.5, 13.0, 16.0, 19.5],
        "Packed": [7.0, 9.0, 11.0, 13.0, 16.0, 18.5, 21.0],
    }
    slots = slots_by_density.get(density, slots_by_density["Moderate"])

    segments = []
    total_spend = 0
    budget_per_day = activity_budget / max(days, 1)

    for day in range(1, days + 1):
        daily_items = []
        rolling_template = templates[day % len(templates):] + templates[:day % len(templates)]

        for index, time_val in enumerate(slots):
            activity_name, detail, base_cost = rolling_template[index % len(rolling_template)]
            adjusted_cost = int(base_cost * (0.85 + (index * 0.05)))
            total_spend += adjusted_cost
            daily_items.append({
                "time": _format_time(time_val),
                "activity": activity_name,
                "details": f"{detail} in {location_name}",
                "location_zone": f"Zone {((day + index) % 4) + 1}",
                "cost": adjusted_cost,
                "duration_minutes": 90 if index % 2 == 0 else 120,
            })

        segments.append({
            "segment_label": f"Day {day}",
            "focus": "Balanced day flow" if density == "Moderate" else ("Easy pace with breaks" if density == "Relaxed" else "High-energy route"),
            "daily_budget_target": int(budget_per_day),
            "activities": daily_items,
        })

    return segments, total_spend


def _build_hourwise_itinerary(hours, mood, density, activity_budget, location_name):
    templates = _mood_activity_templates().get(mood, _mood_activity_templates()["Relaxing"])
    step_map = {
        "Relaxed": 3,
        "Moderate": 2,
        "Packed": 1.5,
    }
    hour_step = step_map.get(density, 2)

    activities = []
    total_spend = 0
    current_hour = 8.0
    blocks = max(1, int(math.ceil(hours / hour_step)))

    for block in range(blocks):
        activity_name, detail, base_cost = templates[block % len(templates)]
        adjusted_cost = int(base_cost * (0.9 + (block % 3) * 0.08))
        total_spend += adjusted_cost
        end_hour = current_hour + hour_step

        activities.append({
            "time": f"{_format_time(current_hour)} - {_format_time(end_hour)}",
            "activity": activity_name,
            "details": f"{detail} around {location_name}",
            "location_zone": f"Sector {((block % 5) + 1)}",
            "cost": adjusted_cost,
            "duration_minutes": int(hour_step * 60),
        })
        current_hour = end_hour

    return [
        {
            "segment_label": f"Hour-wise Plan ({hours}h)",
            "focus": "Flexible micro-itinerary",
            "daily_budget_target": int(activity_budget),
            "activities": activities,
        }
    ], total_spend


def recommend_trip(location, duration, budget_str, mood, preferences, companions, transport_mode, plan_mode="Day-wise", pace="Moderate"):
    try:
        joblib.load(MODEL_PATH)
    except Exception:
        pass

    random.seed(42)

    total_budget = _get_budget_total(budget_str)
    location_name = location.get("name", "your destination")
    planning_mode = plan_mode if plan_mode in ["Day-wise", "Hour-wise"] else "Day-wise"
    activity_density = _density_from_pace_and_mood(mood, pace)

    if planning_mode == "Hour-wise":
        total_hours = max(1, int(duration))
        equivalent_days = max(total_hours / 24, 0.5)
        nights = max(0, math.ceil(total_hours / 24) - 1)
    else:
        total_hours = max(1, int(duration)) * 24
        equivalent_days = max(1, int(duration))
        nights = max(1, int(duration) - 1)

    stay_budget = total_budget * (0.35 if planning_mode == "Hour-wise" else 0.4)
    transport_budget = total_budget * 0.2
    activity_budget = total_budget - stay_budget - transport_budget

    stays_result = _build_stays(stay_budget=stay_budget, nights=nights, plan_mode=planning_mode)
    transport_result = _build_transport(
        transport_budget=transport_budget,
        duration_days=equivalent_days,
        selected_transport=transport_mode,
    )

    if planning_mode == "Hour-wise":
        itinerary_segments, itinerary_spend = _build_hourwise_itinerary(
            hours=max(1, int(duration)),
            mood=mood,
            density=activity_density,
            activity_budget=activity_budget,
            location_name=location_name,
        )
        duration_label = f"{int(duration)} hours"
    else:
        itinerary_segments, itinerary_spend = _build_daywise_itinerary(
            days=max(1, int(duration)),
            mood=mood,
            density=activity_density,
            activity_budget=activity_budget,
            location_name=location_name,
        )
        duration_label = f"{int(duration)} days"

    current_scene = _build_scene(mood)
    activity_budget_remaining = max(0, int(activity_budget - itinerary_spend))

    return {
        "matrix": {
            "stays": {
                "budget_allocated": int(stay_budget),
                "options": stays_result,
                "primary_filter": "Total Budget",
                "secondary_filter": "Comfort + commute"
            },
            "places_to_visit": {
                "budget_allocated": int(activity_budget),
                "remaining_budget": activity_budget_remaining,
                "mood": mood,
                "primary_filter": "Selected Mood",
                "secondary_filter": "Remaining Budget",
                "pace": pace,
                "companions": companions,
            },
            "transport": {
                "budget_allocated": int(transport_budget),
                "options": transport_result,
                "primary_filter": "Locations",
                "secondary_filter": "Distance & Availability"
            },
            "the_scene": {
                "mood": mood,
                "category": current_scene["category"],
                "visual_cue": current_scene["icon"]
            },
            "itinerary": {
                "duration": int(duration),
                "duration_label": duration_label,
                "planning_mode": planning_mode,
                "density": activity_density,
                "segments": itinerary_segments,
                "visual_cue": "Timeline/Calendar View"
            }
        }
    }
