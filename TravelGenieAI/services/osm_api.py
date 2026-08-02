import requests
from settings import OVERPASS_URL

def fetch_places(lat, lon, radius=2000):
    query = f"""
    [out:json];
    (
      node["tourism"](around:{radius},{lat},{lon});
      node["amenity"](around:{radius},{lat},{lon});
      node["shop"](around:{radius},{lat},{lon});
    );
    out;
    """
    response = requests.post(OVERPASS_URL, data={"data": query})
    elements = response.json().get("elements", [])
    places = []
    for e in elements:
        tags = e.get("tags", {})
        if "name" in tags:
            places.append({
                "name": tags.get("name"),
                "type": tags.get("tourism") or tags.get("amenity") or tags.get("shop"),
                "lat": e.get("lat"),
                "lon": e.get("lon")
            })
    return places