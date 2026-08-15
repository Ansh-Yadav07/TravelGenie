"""
TravelGenie Trip Planner — Built from scratch.
Calls the Gemini REST API directly via HTTP (no SDK).
Returns the exact JSON matrix schema the React frontend expects.
"""

import json
import re
import time
import requests
from settings import GEMINI_API_KEY

# ---------------------------------------------------------------------------
# Gemini REST API config
# ---------------------------------------------------------------------------
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent"


def _call_gemini(prompt: str) -> dict:
    """
    Call the Gemini REST API directly via HTTP POST.
    Returns the parsed JSON from Gemini's text response.
    Raises an exception with a clear message if anything goes wrong.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in environment variables")

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    resp = requests.post(url, headers=headers, json=payload, timeout=60)

    if resp.status_code != 200:
        error_detail = resp.text[:500]
        raise RuntimeError(f"Gemini API returned {resp.status_code}: {error_detail}")

    result = resp.json()

    # Extract text from Gemini response structure
    candidates = result.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"Gemini returned no candidates: {json.dumps(result)[:300]}")

    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    if not text.strip():
        raise RuntimeError("Gemini returned empty text")

    return _parse_json_response(text)


def _parse_json_response(text: str) -> dict:
    """Parse JSON from Gemini response, stripping markdown fences if present."""
    text = text.strip()
    # Remove ```json ... ``` wrappers
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    return json.loads(text)


# ---------------------------------------------------------------------------
# Budget helpers
# ---------------------------------------------------------------------------
BUDGET_MAP = {
    "Budget Friendly": 15000,
    "Moderate": 40000,
    "Luxury": 100000,
    "Ultra Luxury": 300000,
}


def _get_total_budget(budget_label: str) -> int:
    return BUDGET_MAP.get(budget_label, 30000)


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------
def _build_prompt(location: str, duration: int, budget_label: str, mood: str,
                  companions: str, transport: str, plan_mode: str, pace: str) -> str:
    """Build a detailed, strict prompt that forces Gemini to return specific places."""
    total = _get_total_budget(budget_label)
    stay_budget = int(total * 0.4)
    transport_budget = int(total * 0.2)
    activity_budget = total - stay_budget - transport_budget
    unit = "hours" if plan_mode == "Hour-wise" else "days"

    return f"""You are an expert Indian travel planner. Create a DETAILED trip plan for {location}.

TRIP PARAMETERS:
- Destination: {location}
- Duration: {duration} {unit}
- Budget: ₹{total:,} ({budget_label})
- Mood: {mood}
- Companions: {companions}
- Transport preference: {transport}
- Planning: {plan_mode}
- Pace: {pace}

BUDGET ALLOCATION:
- Stays: ₹{stay_budget:,}
- Transport: ₹{transport_budget:,}
- Activities & Food: ₹{activity_budget:,}

CRITICAL RULES — YOU MUST FOLLOW THESE:
1. USE ONLY REAL, SPECIFIC PLACE NAMES that actually exist in {location}. 
   - For hotels: use real hotel names like "Hotel Navrang" or "Zostel Kota" — NEVER write "Premium Hotel in {location}" or "Budget Stay".
   - For restaurants: use real restaurant names like "Jodhpur Sweet Home" or "Cafe Flavors" — NEVER write "Local cuisine" or "Try authentic food".
   - For attractions: use real place names like "Jagmandir Palace", "Seven Wonders Park", "Chambal Garden" — NEVER write "Morning exploration" or "Afternoon activity".
2. Every activity MUST have a specific, real place name in the "activity" field.
3. The "details" field should describe what the visitor will do at that specific place.
4. The "location_zone" should be the actual neighborhood/area name in {location}.
5. Costs must be realistic for {location} in India (INR).
6. Generate exactly 3 stay options, 5 transport options, and a full day-by-day itinerary.
7. Each day should have 4-6 activities depending on pace ({pace}).

Return ONLY this JSON structure:
{{
  "stays": [
    {{"name": "Real Hotel Name", "type": "Hotel|Resort|Homestay|Hostel", "amenity": "Key feature", "total_cost": 3000}},
    {{"name": "Real Hotel Name 2", "type": "Hotel", "amenity": "Key feature", "total_cost": 2000}},
    {{"name": "Real Hotel Name 3", "type": "Homestay", "amenity": "Key feature", "total_cost": 1500}}
  ],
  "transport": [
    {{"mode": "Flight", "estimated_total": 5000}},
    {{"mode": "Train", "estimated_total": 1500}},
    {{"mode": "Bus", "estimated_total": 800}},
    {{"mode": "Car Rental", "estimated_total": 3000}},
    {{"mode": "Taxi", "estimated_total": 4000}}
  ],
  "scene": {{
    "category": "Chill|Active|Party|History|Romance|Balanced",
    "visual_cue": "Sun|Mountain|Music|Landmark|Map"
  }},
  "itinerary_segments": [
    {{
      "segment_label": "Day 1",
      "focus": "Theme of the day e.g. Heritage Walk & Local Flavors",
      "activities": [
        {{
          "time": "09:00",
          "activity": "Breakfast at Real Cafe Name",
          "details": "What you will experience at this specific place",
          "location_zone": "Real Area Name",
          "cost": 300,
          "duration_minutes": 60
        }}
      ]
    }}
  ],
  "total_activity_spend": 4000
}}"""


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
def recommend_trip(location: dict | str, duration: int, budget_str: str, mood: str,
                   preferences: list, companions: str, transport_mode: str,
                   plan_mode: str = "Day-wise", pace: str = "Moderate") -> dict:
    """
    Generate a trip plan by calling Gemini.
    Returns the matrix dict the frontend expects.
    """
    loc_name = location.get("name", str(location)) if isinstance(location, dict) else str(location)
    total_budget = _get_total_budget(budget_str)
    stay_budget = int(total_budget * 0.4)
    transport_budget = int(total_budget * 0.2)
    activity_budget = total_budget - stay_budget - transport_budget
    duration_label = f"{duration} hours" if plan_mode == "Hour-wise" else f"{duration} days"

    # Determine density
    if pace == "Chill":
        density = "Relaxed"
    elif pace == "Fast Paced":
        density = "Packed"
    else:
        density = {"Relaxing": "Relaxed", "Adventure": "Packed", "Party": "Packed"}.get(mood, "Moderate")

    try:
        prompt = _build_prompt(loc_name, duration, budget_str, mood, companions,
                               transport_mode, plan_mode, pace)
        data = _call_gemini(prompt)
        print(f"[TravelGenie] ✅ Gemini returned data for '{loc_name}'")

        # Build stays
        stays_options = []
        for s in data.get("stays", []):
            cost = int(s.get("total_cost", 0))
            over = cost > stay_budget
            stays_options.append({
                "name": s.get("name", "Unknown"),
                "type": s.get("type", "Hotel"),
                "amenity": s.get("amenity", "Standard"),
                "total_cost": cost,
                "is_over_budget": over,
                "visual_cue": "red_shadow" if over else "none",
            })

        # Build transport
        transport_options = []
        for t in data.get("transport", []):
            est = int(t.get("estimated_total", 0))
            over = est > transport_budget
            transport_options.append({
                "mode": t.get("mode", "Unknown"),
                "estimated_total": est,
                "is_over_budget": over,
                "visual_cue": "red_shadow" if over else "none",
            })
        transport_options.sort(key=lambda x: x["estimated_total"])

        # Itinerary
        segments = data.get("itinerary_segments", [])
        total_spend = int(data.get("total_activity_spend", 0))
        remaining = max(0, activity_budget - total_spend)

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
                    "remaining_budget": remaining,
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
                    "duration": duration,
                    "duration_label": duration_label,
                    "planning_mode": plan_mode,
                    "density": density,
                    "segments": segments,
                    "visual_cue": "Timeline/Calendar View",
                },
            }
        }

    except Exception as e:
        print(f"[TravelGenie] ❌ ERROR: {e}")
        # Re-raise so the API returns a 500 with the real error instead of silent garbage
        raise RuntimeError(f"Trip generation failed: {e}")
