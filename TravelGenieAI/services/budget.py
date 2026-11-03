"""Deterministic budget model (authoritative). Mirrored in src/lib/planner.js computeBudget —
keep the two identical. All amounts are INR integers for the whole group."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Iterable

from .schemas import PlanRequest

TIERS: dict[str, dict[str, int]] = {
    "budget": {"room_per_night": 1800, "daily_per_person": 1500, "intercity_per_person": 3000},
    "moderate": {"room_per_night": 5000, "daily_per_person": 3000, "intercity_per_person": 8000},
    "luxury": {"room_per_night": 15000, "daily_per_person": 7000, "intercity_per_person": 16000},
    "ultra": {"room_per_night": 40000, "daily_per_person": 15000, "intercity_per_person": 40000},
}


def round100(value: float) -> int:
    """Round to the nearest 100, halves up — matches JS `Math.round(n / 100) * 100`."""
    return int(math.floor(value / 100 + 0.5)) * 100


# How much a spending priority boosts its share of a custom budget.
PRIORITY_WEIGHTS: dict[str, dict[str, float]] = {
    "balanced": {},
    "stay": {"stay": 1.5},
    "experiences": {"activities": 1.5},
    "transport": {"transport": 1.5},
}

# A custom budget below this share of the cheapest tier is flagged as tight.
TIGHT_RATIO = 0.7


@dataclass(frozen=True)
class BudgetPlan:
    tier: str
    travelers: int
    nights: int
    rooms: int
    stay: int
    transport: int
    activities: int
    style: str = "moderate"  # comfort level the money buys; equals `tier` unless the budget is custom
    tight: bool = False

    @property
    def total(self) -> int:
        return self.stay + self.transport + self.activities

    @property
    def allocation(self) -> dict[str, int]:
        return {"stay": self.stay, "transport": self.transport, "activities": self.activities}


def _tier_budget(req: PlanRequest, tier_id: str) -> BudgetPlan:
    tier = TIERS.get(tier_id, TIERS["moderate"])
    travelers = req.travelers
    duration = req.duration

    if req.plan_mode == "hours":
        share = min(1.0, duration / 8)
        return BudgetPlan(
            tier=tier_id, style=tier_id, travelers=travelers, nights=0, rooms=0, stay=0,
            activities=round100(travelers * tier["daily_per_person"] * share),
            transport=round100(travelers * tier["daily_per_person"] * 0.25 * share),
        )

    nights = max(1, duration - 1)
    rooms = math.ceil(travelers / 2)
    transport = (
        round100(travelers * tier["intercity_per_person"])
        if req.has_origin
        else round100(travelers * duration * tier["daily_per_person"] * 0.25)
    )
    return BudgetPlan(
        tier=tier_id, style=tier_id, travelers=travelers, nights=nights, rooms=rooms,
        stay=round100(rooms * nights * tier["room_per_night"]),
        activities=round100(travelers * duration * tier["daily_per_person"]),
        transport=transport,
    )


def nearest_style(req: PlanRequest, total: int) -> str:
    """The tier whose total for this trip is closest (by ratio) to `total`."""
    return min(TIERS, key=lambda t: abs(math.log(total / _tier_budget(req, t).total)))


def compute_budget(req: PlanRequest) -> BudgetPlan:
    total = req.custom_total
    if total is None:
        return _tier_budget(req, req.budget)

    # Split the traveller's own total the way the nearest tier would, then apply their priority.
    style = nearest_style(req, total)
    reference = _tier_budget(req, style)
    boost = PRIORITY_WEIGHTS[req.budget_priority]
    weights = {part: amount * boost.get(part, 1.0) for part, amount in reference.allocation.items()}
    scale = total / sum(weights.values())
    stay = round100(weights["stay"] * scale)
    transport = round100(weights["transport"] * scale)
    return BudgetPlan(
        tier="custom", style=style, travelers=reference.travelers, nights=reference.nights, rooms=reference.rooms,
        stay=stay, transport=transport, activities=max(0, total - stay - transport),
        tight=total < _tier_budget(req, "budget").total * TIGHT_RATIO,
    )


def summarize_budget(
    plan: BudgetPlan,
    stays: Iterable[dict[str, Any]],
    transport: Iterable[dict[str, Any]],
    days: Iterable[dict[str, Any]],
) -> dict[str, Any]:
    """Build the Trip.budget object from the allocation and the normalized plan."""
    stay_est = next((s["total_cost"] for s in stays if s.get("recommended")), 0)
    transport_est = next((t["total_cost"] for t in transport if t.get("recommended")), 0)
    activities_est = sum(a["cost"] for d in days for a in d["activities"])
    estimate_total = stay_est + transport_est + activities_est
    return {
        "tier": plan.tier,
        "style": plan.style,
        "travelers": plan.travelers,
        "nights": plan.nights,
        "rooms": plan.rooms,
        "total": plan.total,
        "allocation": plan.allocation,
        "estimate": {"stay": stay_est, "transport": transport_est, "activities": activities_est, "total": estimate_total},
        "status": "over" if estimate_total > plan.total else "within",
        "delta": plan.total - estimate_total,
    }
