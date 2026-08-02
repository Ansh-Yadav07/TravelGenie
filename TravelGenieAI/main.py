from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.recommender import recommend_trip
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to TravelGenie! Train with /train and plan trips with /plan_trip."}

@app.get("/train")
def train():
    # Mock training for now or call real train_model if dependencies work
    return {"status": "Model trained successfully"}

@app.get("/plan_trip")
def plan_trip(
    location: str,
    duration: int,
    budget: str,
    mood: str,
    plan_mode: str = "Day-wise",
    companions: str = "Solo",
    pace: str = "Moderate",
    transport: str = "Flight",
):
    preferences = []
    
    # We pass dummy location dict as recommender doesn't need real lat/lon for the mock matrix data anymore
    loc_data = {"name": location, "lat": 0, "lon": 0} 
    
    result = recommend_trip(
        location=loc_data,
        duration=duration,
        budget_str=budget,
        mood=mood,
        preferences=preferences,
        companions=companions,
        transport_mode=transport,
        plan_mode=plan_mode,
        pace=pace,
    )
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
