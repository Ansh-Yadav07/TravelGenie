def filter_by_budget(places, budget_range):
    filtered = []
    for p in places:
        if budget_range == "low" and p["type"] in ["fast_food", "cafe", "market"]:
            filtered.append(p)
        elif budget_range == "medium" and p["type"] in ["restaurant", "pub"]:
            filtered.append(p)
        elif budget_range == "high" and p["type"] in ["hotel", "resort"]:
            filtered.append(p)
        else:
            filtered.append(p)
    return filtered

def mood_weight(mood):
    weights = {
        "Relaxed": ["park", "cafe", "beach"],
        "Busy": ["market", "shopping", "urban"],
        "Foodie": ["restaurant", "cafe", "fast_food"],
        "Adventure": ["hiking", "mountain", "sports"],
        "Cultural": ["museum", "theatre", "temple"],
        "Aesthetic": ["architecture", "garden", "historic"]
    }
    return weights.get(mood, [])