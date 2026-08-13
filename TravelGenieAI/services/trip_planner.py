"""
Gemini-powered trip recommender for TravelGenie.
Sends structured prompts to Gemini 1.5 Flash and parses JSON responses
into the exact matrix schema the frontend expects.
"""

import json
import re
import math
import random
from google import genai
from settings import GEMINI_API_KEY

# Initialize the Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_ID = "gemini-1.5-flash"


def _get_budget_total(budget_str):
    """Map budget label to approximate INR total."""
    budget_map = {
        "Budget Friendly": 15000,
        "Moderate": 40000,
        "Luxury": 100000,
        "Ultra Luxury": 300000,
    }
    return budget_map.get(budget_str, 30000)


def _build_gemini_prompt(location_name, duration, budget_str, mood, companions, transport_mode, plan_mode, pace):
    """Build the structured prompt for Gemini."""
    total_budget = _get_budget_total(budget_str)
    duration_unit = "hours" if plan_mode == "Hour-wise" else "days"

    return f"""You are an expert travel planner AI for India. Create a highly specific, realistic trip plan.

TRIP DETAILS:
- Destination: {location_name}
- Duration: {duration} {duration_unit}
- Total Budget: ₹{total_budget:,} INR ({budget_str})
- Mood/Vibe: {mood}
- Travel Companions: {companions}
- Preferred Transport: {transport_mode}
- Planning Mode: {plan_mode}
- Pace: {pace}

BUDGET SPLIT (approximate):
- Stays: 40% = ₹{int(total_budget * 0.4):,}
- Transport: 20% = ₹{int(total_budget * 0.2):,}
- Activities: 40% = ₹{int(total_budget * 0.4):,}

INSTRUCTIONS - BE VERY SPECIFIC:
1. Generate 3 REAL, EXISTING stay/hotel options that actually exist in {location_name}. NO generic names like "Budget Stay". Use exact names (e.g., "Taj Lake Palace", "Zostel Udaipur"). Include the type (Resort/Hotel/Homestay/Hostel) and a relevant amenity. Calculate total_cost based on the duration.
2. Generate transport options for 5 modes (Flight, Train, Bus, Car Rental, Taxi) with realistic cost estimates for traveling to/within {location_name}.
3. Create a {"hour-by-hour" if plan_mode == "Hour-wise" else "day-by-day"} itinerary with REAL places, specific attractions, named restaurants, and actual experiences specific to {location_name}. DO NOT use generic terms like "Morning exploration" or "Local cuisine". Give the EXACT name of the cafe, restaurant, or temple (e.g., "Cafe Mondegar", "City Palace"). Each activity needs a realistic cost in INR.
4. Activities should match the {mood} mood and {pace} pace.
5. All costs must be realistic for {location_name} in India (use INR).

You MUST respond with ONLY valid JSON in this exact structure (no markdown, no explanation):
{{
  "stays": [
    {{
      "name": "Exact Real Hotel Name",
      "type": "Resort|Hotel|Homestay|Hostel",
      "amenity": "Key Feature",
      "total_cost": 5000
    }},
    {{
      "name": "Exact Real Hotel Name 2",
      "type": "Hotel",
      "amenity": "Key Feature",
      "total_cost": 3500
    }},
    {{
      "name": "Exact Real Hotel Name 3",
      "type": "Homestay",
      "amenity": "Key Feature",
      "total_cost": 2000
    }}
  ],
  "transport": [
    {{
      "mode": "Flight",
      "estimated_total": 5000
    }},
    {{
      "mode": "Train",
      "estimated_total": 2000
    }},
    {{
      "mode": "Bus",
      "estimated_total": 1200
    }},
    {{
      "mode": "Car Rental",
      "estimated_total": 3500
    }},
    {{
      "mode": "Taxi",
      "estimated_total": 4000
    }}
  ],
  "scene": {{
    "category": "Chill|Active|Party|History|Romance|Balanced",
    "visual_cue": "Sun|Mountain|Music|Landmark|Map"
  }},
  "itinerary_segments": [
    {{
      "segment_label": "Day 1",
      "focus": "Describe the day's theme",
      "activities": [
        {{
          "time": "09:00",
          "activity": "Specific Activity at Specific Place (e.g., Breakfast at Leopold Cafe)",
          "details": "Brief description of the activity at specific place in {location_name}",
          "location_zone": "Specific Area/Neighborhood name",
          "cost": 500,
          "duration_minutes": 90
        }}
      ]
    }}
  ],
  "total_activity_spend": 5000
}}

IMPORTANT: Return ONLY the JSON object. No backticks, no markdown formatting, no explanation text.
"""


def _parse_gemini_response(response_text):
    """Parse Gemini's response, handling potential markdown formatting."""
    text = response_text.strip()

    # Remove markdown code fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)

    return json.loads(text)


def _density_from_pace_and_mood(mood, pace):
    """Determine activity density from pace and mood."""
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


def recommend_trip(location, duration, budget_str, mood, preferences, companions, transport_mode, plan_mode="Day-wise", pace="Moderate"):
    """
    Generate a trip plan using Gemini AI.
    Falls back to a basic template if the API call fails.
    Returns the same matrix schema the frontend expects.
    """
    location_name = location.get("name", "your destination") if isinstance(location, dict) else str(location)
    total_budget = _get_budget_total(budget_str)
    activity_density = _density_from_pace_and_mood(mood, pace)

    # Calculate time-based values
    if plan_mode == "Hour-wise":
        total_hours = max(1, int(duration))
        nights = max(0, math.ceil(total_hours / 24) - 1)
    else:
        total_hours = max(1, int(duration)) * 24
        nights = max(1, int(duration) - 1)

    # Budget allocation
    stay_budget = int(total_budget * 0.4)
    transport_budget = int(total_budget * 0.2)
    activity_budget = total_budget - stay_budget - transport_budget

    # Duration label
    duration_label = f"{int(duration)} hours" if plan_mode == "Hour-wise" else f"{int(duration)} days"

    try:
        # Call Gemini API
        prompt = _build_gemini_prompt(
            location_name=location_name,
            duration=duration,
            budget_str=budget_str,
            mood=mood,
            companions=companions,
            transport_mode=transport_mode,
            plan_mode=plan_mode,
            pace=pace,
        )

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
        )

        data = _parse_gemini_response(response.text)

        # Build stays with budget flags
        stays_options = []
        for stay in data.get("stays", []):
            total_cost = int(stay.get("total_cost", 0))
            is_over = total_cost > stay_budget
            stays_options.append({
                "name": stay.get("name", "Unknown Stay"),
                "type": stay.get("type", "Hotel"),
                "amenity": stay.get("amenity", "Standard"),
                "total_cost": total_cost,
                "is_over_budget": is_over,
                "visual_cue": "red_shadow" if is_over else "none",
            })

        # Build transport with budget flags
        transport_options = []
        for t in data.get("transport", []):
            est = int(t.get("estimated_total", 0))
            is_over = est > transport_budget
            transport_options.append({
                "mode": t.get("mode", "Unknown"),
                "estimated_total": est,
                "is_over_budget": is_over,
                "visual_cue": "red_shadow" if is_over else "none",
            })
        transport_options.sort(key=lambda x: x["estimated_total"])

        # Build itinerary
        itinerary_segments = data.get("itinerary_segments", [])
        total_activity_spend = int(data.get("total_activity_spend", 0))
        activity_budget_remaining = max(0, activity_budget - total_activity_spend)

        # Scene
        scene = data.get("scene", {})

        return {
            "matrix": {
                "stays": {
                    "budget_allocated": stay_budget,
                    "options": stays_options,
                    "primary_filter": "Total Budget",
                    "secondary_filter": "Comfort + commute",
                },
                "places_to_visit": {
                    "budget_allocated": activity_budget,
                    "remaining_budget": activity_budget_remaining,
                    "mood": mood,
                    "primary_filter": "Selected Mood",
                    "secondary_filter": "Remaining Budget",
                    "pace": pace,
                    "companions": companions,
                },
                "transport": {
                    "budget_allocated": transport_budget,
                    "options": transport_options,
                    "primary_filter": "Locations",
                    "secondary_filter": "Distance & Availability",
                },
                "the_scene": {
                    "mood": mood,
                    "category": scene.get("category", "Balanced"),
                    "visual_cue": scene.get("visual_cue", "Map"),
                },
                "itinerary": {
                    "duration": int(duration),
                    "duration_label": duration_label,
                    "planning_mode": plan_mode,
                    "density": activity_density,
                    "segments": itinerary_segments,
                    "visual_cue": "Timeline/Calendar View",
                },
            }
        }

    except Exception as e:
        print(f"[TravelGenie] Gemini API error: {e}")
        # Fallback: return a minimal but valid response so the frontend doesn't crash
        return _fallback_response(
            location_name=location_name,
            duration=int(duration),
            budget_str=budget_str,
            mood=mood,
            plan_mode=plan_mode,
            pace=pace,
            companions=companions,
            stay_budget=stay_budget,
            transport_budget=transport_budget,
            activity_budget=activity_budget,
            activity_density=activity_density,
            duration_label=duration_label,
        )


def _fallback_response(location_name, duration, budget_str, mood, plan_mode, pace, companions, stay_budget, transport_budget, activity_budget, activity_density, duration_label):
    """Minimal fallback when Gemini is unavailable."""
    random.seed(42)

    stays_options = [
        {"name": f"Premium Hotel in {location_name}", "type": "Hotel", "amenity": "Central Location", "total_cost": int(stay_budget * 0.9), "is_over_budget": False, "visual_cue": "none"},
        {"name": f"Budget Stay in {location_name}", "type": "Homestay", "amenity": "Local Experience", "total_cost": int(stay_budget * 0.5), "is_over_budget": False, "visual_cue": "none"},
        {"name": f"Luxury Resort in {location_name}", "type": "Resort", "amenity": "Pool & Spa", "total_cost": int(stay_budget * 1.3), "is_over_budget": True, "visual_cue": "red_shadow"},
    ]

    transport_options = [
        {"mode": "Bus", "estimated_total": int(transport_budget * 0.4), "is_over_budget": False, "visual_cue": "none"},
        {"mode": "Train", "estimated_total": int(transport_budget * 0.6), "is_over_budget": False, "visual_cue": "none"},
        {"mode": "Taxi", "estimated_total": int(transport_budget * 0.8), "is_over_budget": False, "visual_cue": "none"},
        {"mode": "Car Rental", "estimated_total": int(transport_budget * 1.0), "is_over_budget": False, "visual_cue": "none"},
        {"mode": "Flight", "estimated_total": int(transport_budget * 1.4), "is_over_budget": True, "visual_cue": "red_shadow"},
    ]

    days = max(1, duration) if plan_mode == "Day-wise" else 1
    segments = []
    for d in range(1, days + 1):
        segments.append({
            "segment_label": f"Day {d}" if plan_mode == "Day-wise" else f"Hour-wise Plan ({duration}h)",
            "focus": f"Explore {location_name} at a {pace.lower()} pace",
            "activities": [
                {"time": "09:00", "activity": f"Morning exploration", "details": f"Visit popular spots in {location_name}", "location_zone": "City Center", "cost": int(activity_budget * 0.1 / days), "duration_minutes": 120},
                {"time": "12:00", "activity": f"Local cuisine", "details": f"Try authentic food in {location_name}", "location_zone": "Food District", "cost": int(activity_budget * 0.08 / days), "duration_minutes": 90},
                {"time": "15:00", "activity": f"Afternoon activity", "details": f"{mood} experience in {location_name}", "location_zone": "Activity Zone", "cost": int(activity_budget * 0.12 / days), "duration_minutes": 120},
                {"time": "19:00", "activity": f"Evening experience", "details": f"Wind down in {location_name}", "location_zone": "Entertainment Area", "cost": int(activity_budget * 0.1 / days), "duration_minutes": 120},
            ],
        })

    return {
        "matrix": {
            "stays": {"budget_allocated": stay_budget, "options": stays_options, "primary_filter": "Total Budget", "secondary_filter": "Comfort + commute"},
            "places_to_visit": {"budget_allocated": activity_budget, "remaining_budget": int(activity_budget * 0.3), "mood": mood, "primary_filter": "Selected Mood", "secondary_filter": "Remaining Budget", "pace": pace, "companions": companions},
            "transport": {"budget_allocated": transport_budget, "options": transport_options, "primary_filter": "Locations", "secondary_filter": "Distance & Availability"},
            "the_scene": {"mood": mood, "category": "Balanced", "visual_cue": "Map"},
            "itinerary": {"duration": duration, "duration_label": duration_label, "planning_mode": plan_mode, "density": activity_density, "segments": segments, "visual_cue": "Timeline/Calendar View"},
        }
    }
