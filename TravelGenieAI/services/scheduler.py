def build_schedule(places, duration_hours, mood, preferences):
    max_places = int(duration_hours // 1.5)
    selected = []
    for pref in preferences:
        for p in places:
            if pref in (p["type"] or ""):
                selected.append(p)
                if len(selected) >= max_places:
                    return selected
    return selected[:max_places]