"""
TravelGenie Backend — FastAPI server.
Serves the /plan_trip endpoint that the React frontend calls.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.trip_planner import recommend_trip
import uvicorn

app = FastAPI(
    title="TravelGenie API",
    description="AI-powered trip planning using Gemini",
    version="3.0.0",
)

# Allow all origins so the frontend (on any domain) can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"status": "ok", "message": "TravelGenie API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/plan_trip")
def plan_trip(
    location: str,
    duration: int,
    budget: str = "Moderate",
    mood: str = "Relaxing",
    plan_mode: str = "Day-wise",
    companions: str = "Solo",
    pace: str = "Moderate",
    transport: str = "Flight",
):
    """Generate an AI-powered trip plan."""
    if not location or not location.strip():
        raise HTTPException(status_code=400, detail="Location is required")
    if duration < 1:
        raise HTTPException(status_code=400, detail="Duration must be at least 1")

    try:
        result = recommend_trip(
            location={"name": location.strip()},
            duration=duration,
            budget_str=budget,
            mood=mood,
            preferences=[],
            companions=companions,
            transport_mode=transport,
            plan_mode=plan_mode,
            pace=pace,
        )
        return result
    except Exception as e:
        print(f"[TravelGenie] Plan trip error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
