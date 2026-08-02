
from models.recommender import recommend_trip

# Mock data
location_name = "Shimla"
lon = 77.1734
lat = 31.1048
duration = 3
budget = "low"
mood = "Cultural"
preferences = ["spiritual", "art"]
companions = "Solo"
transport = "Bus"

location_data = {"lon": lon, "lat": lat}

try:
    # This matches main.py usage
    result = recommend_trip(location_data, duration, budget, mood, preferences, companions, transport)
    print("Result keys:", result.keys())
    print("Top recommendation score:", result['recommended_pois'][0]['score'] if result['recommended_pois'] else "No recs")
except Exception as e:
    print(e)
