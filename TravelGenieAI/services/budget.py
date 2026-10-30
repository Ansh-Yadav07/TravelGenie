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


@dataclass(frozen=True)
class BudgetPlan:
    tier: str
    travelers: int
    nights: int
    rooms: int
    stay: int
    transport: int
    activities: int

    @property
    def total(self) -> int:
        return self.stay + self.transport + self.activities

    @property
    def allocation(self) -> dict[str, int]:
        return {"stay": self.stay, "transport": self.transport, "activities": self.activities}


def compute_budget(req: PlanRequest) -> BudgetPlan:
    tier = TIERS.get(req.budget, TIERS["moderate"])
    travelers = req.travelers
    duration = req.duration

    if req.plan_mode == "hours":
        share = min(1.0, duration / 8)
        return BudgetPlan(
            tier=req.budget, travelers=travelers, nights=0, rooms=0, stay=0,
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
        tier=req.budget, travelers=travelers, nights=nights, rooms=rooms,
        stay=round100(rooms * nights * tier["room_per_night"]),
        activities=round100(travelers * duration * tier["daily_per_person"]),
        transport=transport,
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
        "travelers": plan.travelers,
        "nights": plan.nights,
        "rooms": plan.rooms,
        "total": plan.total,
        "allocation": plan.allocation,
        "estimate": {"stay": stay_est, "transport": transport_est, "activities": activities_est, "total": estimate_total},
        "status": "over" if estimate_total > plan.total else "within",
        "delta": plan.total - estimate_total,
    }
