from services.budget import compute_budget, round100, summarize_budget
from services.schemas import PlanRequest


def req(**kw):
    base = {"destination": "Goa"}
    base.update(kw)
    return PlanRequest(**base)


def test_round100_rounds_half_up_like_js():
    # JS Math.round rounds .5 up; Python's round() would give 200 / 0 here.
    assert round100(250) == 300
    assert round100(50) == 100
    assert round100(149.99) == 100
    assert round100(6750) == 6800
    assert round100(0) == 0


def test_days_mode_with_origin():
    b = compute_budget(req(origin="Delhi", duration=4, travelers=2, budget="moderate"))
    assert (b.nights, b.rooms) == (3, 1)
    assert b.allocation == {"stay": 15000, "transport": 16000, "activities": 24000}
    assert b.total == 55000


def test_days_mode_without_origin_uses_local_transport_share():
    b = compute_budget(req(duration=3, travelers=3, budget="budget"))
    assert (b.nights, b.rooms) == (2, 2)
    assert b.stay == round100(2 * 2 * 1800)            # 7200
    assert b.activities == round100(3 * 3 * 1500)      # 13500
    assert b.transport == round100(3 * 3 * 1500 * 0.25)  # 3375 → 3400
    assert b.transport == 3400


def test_single_day_still_counts_one_night():
    b = compute_budget(req(duration=1, travelers=1, budget="luxury"))
    assert (b.nights, b.rooms) == (1, 1)
    assert b.stay == 15000


def test_hours_mode():
    b = compute_budget(req(plan_mode="hours", duration=6, travelers=3, budget="moderate", origin="Pune"))
    assert (b.nights, b.rooms, b.stay) == (0, 0, 0)
    assert b.activities == round100(3 * 3000 * 0.75)          # 6750 → 6800
    assert b.transport == round100(3 * 3000 * 0.25 * 0.75)    # 1687.5 → 1700
    assert b.total == 8500


def test_hours_share_caps_at_one():
    b = compute_budget(req(plan_mode="hours", duration=12, travelers=1, budget="ultra"))
    assert b.activities == 15000
    assert b.transport == 3800  # 3750 → 3800


def test_summarize_budget_over_and_within():
    plan = compute_budget(req(origin="Delhi", duration=4, travelers=2))
    stays = [{"total_cost": 9000, "recommended": False}, {"total_cost": 13500, "recommended": True}]
    transport = [{"total_cost": 14200, "recommended": True}]
    days = [{"activities": [{"cost": 5000}, {"cost": 6800}]}]
    out = summarize_budget(plan, stays, transport, days)
    assert out["estimate"] == {"stay": 13500, "transport": 14200, "activities": 11800, "total": 39500}
    assert out["status"] == "within"
    assert out["delta"] == 55000 - 39500

    days = [{"activities": [{"cost": 40000}]}]
    out = summarize_budget(plan, stays, transport, days)
    assert out["status"] == "over"
    assert out["delta"] < 0


def test_summarize_budget_without_stays():
    plan = compute_budget(req(plan_mode="hours", duration=4))
    out = summarize_budget(plan, [], [{"total_cost": 300, "recommended": True}], [{"activities": [{"cost": 1000}]}])
    assert out["estimate"]["stay"] == 0
    assert out["estimate"]["total"] == 1300
