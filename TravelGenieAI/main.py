from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.trip_planner import recommend_trip
import uvicorn

app = FastAPI(
    title="TravelGenie AI",
    description="AI-powered trip planning API using Gemini",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to TravelGenie AI! Plan trips with /plan_trip.",
        "version": "2.0.0",
        "engine": "Gemini 2.0 Flash",
    }


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
    """Generate an AI-powered trip plan using Gemini."""
    if not location or not location.strip():
        raise HTTPException(status_code=400, detail="Location is required")
    if duration < 1:
        raise HTTPException(status_code=400, detail="Duration must be at least 1")

    loc_data = {"name": location.strip(), "lat": 0, "lon": 0}

    result = recommend_trip(
        location=loc_data,
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


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
