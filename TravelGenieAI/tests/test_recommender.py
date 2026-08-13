from services.trip_planner import recommend_trip

def test_recommend_trip():
    location = {"lat": 15.2993, "lon": 73.8567}
    result = recommend_trip(location, 8, "medium", "Relaxed", ["beach","food"], "friends", "car")
    assert "itinerary" in result
    assert isinstance(result["itinerary"], list)