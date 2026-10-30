"""Trip planning orchestration: budget → prompt → Gemini → validate/normalize → Trip."""

from __future__ import annotations

import asyncio
import contextlib
import datetime as dt
import json
import logging
import re
import time
import uuid
from typing import Any, AsyncIterator

from pydantic import ValidationError

from settings import Settings

from . import demo
from .budget import BudgetPlan, compute_budget, summarize_budget
from .gemini import GeminiClient, GeminiError
from .prompt import build_prompt, sanitize
from .schemas import CATEGORIES, RAW_PLAN_SCHEMA, TRANSPORT_MODES, VIBES, PlanRequest, Trip

log = logging.getLogger("travelgenie.planner")

STATUS_BY_CODE = {
    "bad_request": 422,
    "missing_api_key": 503,
    "rate_limited": 429,
    "model_unavailable": 503,
    "invalid_output": 502,
    "timeout": 504,
    "upstream_error": 502,
}

MISSING_KEY_MESSAGE = (
    "The AI planner isn't configured: set GEMINI_API_KEY in TravelGenieAI/.env "
    "(or TRAVELGENIE_DEMO=1 for demo mode) and restart the server."
)


class PlannerError(Exception):
    def __init__(self, code: str, message: str, retryable: bool = True) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.retryable = retryable

    @property
    def status_code(self) -> int:
        return STATUS_BY_CODE.get(self.code, 500)

    def to_dict(self) -> dict[str, Any]:
        return {"code": self.code, "message": self.message, "retryable": self.retryable}

    @classmethod
    def from_gemini(cls, err: GeminiError) -> "PlannerError":
        return cls(err.code, err.message, err.retryable)


def invalid_output(detail: str) -> PlannerError:
    log.warning("Invalid model output: %s", detail)
    return PlannerError("invalid_output", "The AI returned an incomplete plan. Please try again.", True)


def timeout_error() -> PlannerError:
    return PlannerError("timeout", "Planning took too long. Please try again — shorter trips generate faster.", True)


# ── Small coercion helpers ──────────────────────────────────────────────────

def _text(value: Any, limit: int = 300) -> str:
    if value is None or isinstance(value, (dict, list)):
        return ""
    text = re.sub(r"\s+", " ", str(value)).strip()
    if len(text) > limit:
        cut = text[: limit - 1].rsplit(" ", 1)[0] if " " in text[: limit - 1] else text[: limit - 1]
        text = cut.rstrip(" ,.;:-") + "…"
    return text


def _short_title(value: str, limit: int = 48) -> str:
    if len(value) <= limit:
        return value
    words = value[:limit].rsplit(" ", 1)[0] if " " in value[:limit] else value[:limit]
    return words.rstrip(" ,.;:-&–—")


def _money(value: Any) -> int:
    """Coerce a cost to a non-negative int (accepts '₹1,200', 1200.6, '1200')."""
    if isinstance(value, bool):
        return 0
    if isinstance(value, (int, float)):
        number = float(value)
    else:
        match = re.search(r"\d[\d,]*(?:\.\d+)?", str(value or ""))
        if not match:
            return 0
        number = float(match.group(0).replace(",", ""))
    if number != number or number < 0:  # NaN / negative
        return 0
    return int(round(min(number, 100_000_000)))


def _rating(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number != number or number <= 0:
        return None
    if number > 5:
        number = number / 2 if number <= 10 else 5.0
    return round(min(number, 5.0), 1)


_TIME_RE = re.compile(r"^\s*(\d{1,2})(?:\s*[:.h]\s*(\d{2}))?\s*(?:hrs?)?\s*([ap])?\.?\s*(?:m\.?)?\s*$", re.I)


def normalize_time(value: Any) -> str | None:
    """'9:00 AM' → '09:00', '21.30' → '21:30', '7pm' → '19:00'. None when unparseable."""
    match = _TIME_RE.match(str(value or ""))
    if not match:
        return None
    hour, minute, ampm = int(match.group(1)), int(match.group(2) or 0), (match.group(3) or "").lower()
    if minute > 59:
        return None
    if ampm:
        if not 1 <= hour <= 12:
            return None
        hour = hour % 12 + (12 if ampm == "p" else 0)
    elif match.group(2) is None:
        return None  # bare number like "9" — ambiguous
    if hour == 24 and minute == 0:
        hour = 0
    if hour > 23:
        return None
    return f"{hour:02d}:{minute:02d}"


def _add_minutes(hhmm: str, minutes: int) -> str:
    h, m = map(int, hhmm.split(":"))
    total = min(23 * 60 + 59, h * 60 + m + max(0, minutes))
    return f"{total // 60:02d}:{total % 60:02d}"


CATEGORY_ALIASES = {
    "restaurant": "food", "meal": "food", "breakfast": "food", "lunch": "food", "dinner": "food", "cafe": "food",
    "dining": "food", "drinks": "nightlife", "bar": "nightlife", "party": "nightlife", "club": "nightlife",
    "sightseeing": "sight", "attraction": "sight", "landmark": "sight", "viewpoint": "sight", "beach": "nature",
    "heritage": "culture", "history": "culture", "museum": "culture", "temple": "culture", "religious": "culture",
    "spa": "wellness", "yoga": "wellness", "relax": "wellness", "market": "shopping", "travel": "transit",
    "transport": "transit", "arrival": "transit", "departure": "transit", "hotel": "stay", "check-in": "stay",
    "checkin": "stay", "accommodation": "stay", "sports": "adventure", "trek": "adventure",
}

MODE_ALIASES = {
    "taxi": "cab", "uber": "cab", "ola": "cab", "ride-hailing": "cab", "rideshare": "cab", "rickshaw": "auto",
    "auto-rickshaw": "auto", "autorickshaw": "auto", "tuk-tuk": "auto", "bike": "scooter", "motorbike": "scooter",
    "moped": "scooter", "two-wheeler": "scooter", "car rental": "car", "self-drive": "car", "drive": "car",
    "rental car": "car", "boat": "ferry", "metro rail": "metro", "subway": "metro", "local train": "train",
    "plane": "flight", "air": "flight", "walking": "walk", "on foot": "walk", "volvo bus": "bus", "coach": "bus",
}

MOOD_VIBE = {"relaxing": "chill", "adventure": "active", "romantic": "romance", "cultural": "heritage", "party": "party"}


def _enum(value: Any, allowed: tuple[str, ...], aliases: dict[str, str], default: str) -> str:
    key = _text(value, 40).lower()
    if key in allowed:
        return key
    if key in aliases:
        return aliases[key]
    for alias, target in aliases.items():
        if alias in key:
            return target
    return default


def _list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


# ── Model text → raw plan ───────────────────────────────────────────────────

def parse_model_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)
    try:
        data = json.loads(cleaned)
    except ValueError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start == -1 or end <= start:
            raise invalid_output("response is not JSON") from None
        try:
            data = json.loads(cleaned[start : end + 1])
        except ValueError as exc:
            raise invalid_output(f"response JSON did not parse ({exc})") from None
    if not isinstance(data, dict):
        raise invalid_output("response JSON is not an object")
    return data


# ── Raw plan → Trip ─────────────────────────────────────────────────────────

def _normalize_activities(raw_activities: list[Any], destination: str) -> list[dict[str, Any]]:
    items: list[tuple[str, int, dict[str, Any]]] = []
    previous_time: str | None = None
    previous_duration = 60
    for index, raw in enumerate(_list(raw_activities)):
        raw = _dict(raw)
        title = _text(raw.get("title"), 120)
        if not title:
            continue
        duration = _money(raw.get("duration_minutes")) if raw.get("duration_minutes") not in (None, "") else 60
        duration = max(0, min(duration, 720))
        time_str = normalize_time(raw.get("time"))
        if time_str is None:
            time_str = _add_minutes(previous_time, previous_duration) if previous_time else "09:00"
        area = _text(raw.get("area"), 80)
        maps_query = _text(raw.get("maps_query"), 160)
        if not maps_query:
            maps_query = ", ".join(part for part in (title, area, destination) if part)
        items.append((time_str, index, {
            "time": time_str,
            "title": title,
            "description": _text(raw.get("description"), 500),
            "area": area,
            "category": _enum(raw.get("category"), CATEGORIES, CATEGORY_ALIASES, "other"),
            "cost": _money(raw.get("cost")),
            "duration_minutes": duration,
            "maps_query": maps_query,
        }))
        previous_time, previous_duration = time_str, duration
    items.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in items]


def _pick_recommended(options: list[dict[str, Any]], limit: int, prefer: str | None = None,
                      prefer_priciest: bool = False) -> int | None:
    if not options:
        return None
    within = [i for i, o in enumerate(options) if o["total_cost"] <= limit]
    if within:
        if prefer:
            preferred = [i for i in within if options[i].get("mode") == prefer]
            if preferred:
                return preferred[0]
        if prefer_priciest:
            return max(within, key=lambda i: (options[i]["total_cost"], -i))
        return within[0]
    return min(range(len(options)), key=lambda i: (options[i]["total_cost"], i))


def normalize_plan(raw: dict[str, Any], req: PlanRequest, budget: BudgetPlan, *, model: str, demo_mode: bool,
                   generation_ms: int) -> dict[str, Any]:
    """Turn the model's raw plan into a contract-valid Trip dict. Raises PlannerError(invalid_output)."""
    raw = _dict(raw)
    destination = sanitize(req.destination) or req.destination
    hours_mode = req.plan_mode == "hours"
    scope = "intercity" if (req.has_origin and not hours_mode) else "local"

    # Days
    required_days = req.total_days
    days: list[dict[str, Any]] = []
    for raw_day in _list(raw.get("days")):
        raw_day = _dict(raw_day)
        activities = _normalize_activities(_list(raw_day.get("activities")), destination)
        if not activities:
            continue
        days.append({"title": _text(raw_day.get("title"), 80), "activities": activities})
    if len(days) < required_days:
        raise invalid_output(f"expected {required_days} day(s), got {len(days)} usable")
    days = days[:required_days]
    for number, day in enumerate(days, start=1):
        day["day"] = number
        day["title"] = day["title"] or (f"Day {number} in {destination}" if not hours_mode else f"{req.duration} hours in {destination}")
        day["total_cost"] = sum(a["cost"] for a in day["activities"])
    days = [{"day": d["day"], "title": d["title"], "total_cost": d["total_cost"], "activities": d["activities"]} for d in days]

    # Stays (days mode only)
    stays: list[dict[str, Any]] = []
    if not hours_mode:
        for raw_stay in _list(raw.get("stays")):
            raw_stay = _dict(raw_stay)
            name = _text(raw_stay.get("name"), 100)
            if not name:
                continue
            price = _money(raw_stay.get("price_per_night"))
            stays.append({
                "name": name,
                "type": _text(raw_stay.get("type"), 40) or "Hotel",
                "area": _text(raw_stay.get("area"), 80),
                "highlight": _text(raw_stay.get("highlight"), 160),
                "price_per_night": price,
                "total_cost": price * budget.rooms * budget.nights,
                "rating": _rating(raw_stay.get("rating")),
                "recommended": False,
                "over_budget": False,
            })
            if len(stays) == 3:
                break
        if not stays:
            raise invalid_output("no stays returned")
        for stay in stays:
            stay["over_budget"] = stay["total_cost"] > budget.stay
        rec = _pick_recommended(stays, budget.stay, prefer_priciest=True)
        if rec is not None:
            stays[rec]["recommended"] = True
            stays.insert(0, stays.pop(rec))

    # Transport
    transport: list[dict[str, Any]] = []
    for raw_opt in _list(raw.get("transport")):
        raw_opt = _dict(raw_opt)
        title = _text(raw_opt.get("title"), 120)
        mode = _enum(raw_opt.get("mode"), TRANSPORT_MODES, MODE_ALIASES, "other")
        if not title:
            continue
        cost = _money(raw_opt.get("total_cost"))
        transport.append({
            "mode": mode,
            "title": title,
            "details": _text(raw_opt.get("details"), 300),
            "duration": _text(raw_opt.get("duration"), 40),
            "total_cost": cost,
            "recommended": False,
            "over_budget": cost > budget.transport,
        })
        if len(transport) == 5:
            break
    if not transport:
        raise invalid_output("no transport options returned")
    rec = _pick_recommended(transport, budget.transport, prefer=req.transport if scope == "intercity" else None)
    if rec is not None:
        transport[rec]["recommended"] = True
        transport.insert(0, transport.pop(rec))

    # Overview
    ov = _dict(raw.get("overview"))
    unit = "day" if not hours_mode else "hour"
    title = _short_title(_text(ov.get("title"), 120)) or _short_title(
        f"{req.duration} {unit}{'s' if req.duration != 1 else ''} in {destination}")
    summary = _text(ov.get("summary"), 600) or (
        f"A {req.pace} {req.mood} {'trip' if not hours_mode else 'outing'} to {destination} "
        f"for {req.travelers} traveller{'s' if req.travelers != 1 else ''}.")
    highlights = [h for h in (_text(x, 80) for x in _list(ov.get("highlights"))) if h][:5]
    if len(highlights) < 3:
        for activity in (a for d in days for a in d["activities"] if a["category"] not in ("transit", "stay", "food")):
            if len(highlights) >= 3:
                break
            if activity["title"] not in highlights:
                highlights.append(activity["title"])
    vibe = _enum(ov.get("vibe"), VIBES, {}, MOOD_VIBE.get(req.mood, "balanced"))

    tips = [t for t in (_text(x, 300) for x in _list(raw.get("tips"))) if t][:6]

    trip = {
        "id": uuid.uuid4().hex[:12],
        "created_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "request": req.model_dump(mode="json"),
        "meta": {"model": model, "demo": demo_mode, "currency": "INR", "generation_ms": int(generation_ms)},
        "overview": {"title": title, "summary": summary, "highlights": highlights, "vibe": vibe},
        "budget": summarize_budget(budget, stays, transport, days),
        "stays": stays,
        "transport_scope": scope,
        "transport": transport,
        "days": days,
        "tips": tips,
    }
    try:
        return Trip.model_validate(trip).model_dump(mode="json")
    except ValidationError as exc:  # pragma: no cover - normalization should make this unreachable
        raise invalid_output(f"normalized trip failed validation: {exc}") from exc


# ── Streaming progress ──────────────────────────────────────────────────────

STAGE_ORDER = ["connecting", "thinking", "overview", "stays", "transport", "days", "tips", "finalizing"]
STAGE_PERCENT = {"connecting": 3, "thinking": 8, "overview": 14, "stays": 22, "transport": 30, "days": 38, "tips": 90, "finalizing": 96}
_KEY_RE = re.compile(r'"(overview|stays|transport|days|activities|tips)"\s*:')
_OVERLAP = 40
MIN_RESTART_SECONDS = 25.0  # only restart a dead stream on the next model if this much time is left


class ProgressTracker:
    """Derives real progress from the JSON text the model has streamed so far."""

    def __init__(self, req: PlanRequest) -> None:
        self.req = req
        self.destination = sanitize(req.destination) or "your destination"
        self.total_days = req.total_days
        self.hours_mode = req.plan_mode == "hours"
        self.intercity = req.has_origin and not self.hours_mode
        self.stage_index = -1
        self.day = 0
        self.percent = 0
        self.buffer = ""
        self._scan_from = 0

    def _message(self, stage: str) -> str:
        if stage == "connecting":
            return "Connecting to the planner…"
        if stage == "thinking":
            return f"Thinking about your trip to {self.destination}…"
        if stage == "overview":
            return "Sketching the big picture…"
        if stage == "stays":
            return "Mapping out the neighbourhood…" if self.hours_mode else "Finding places to stay…"
        if stage == "transport":
            return f"Comparing ways to get to {self.destination}…" if self.intercity else "Working out how to get around…"
        if stage == "days":
            return "Building your itinerary…" if self.hours_mode else f"Planning day {self.day} of {self.total_days}…"
        if stage == "tips":
            return "Adding local tips…"
        return "Checking the budget and finishing up…"

    def _event(self, stage: str) -> dict[str, Any]:
        if stage == "days":
            span = STAGE_PERCENT["tips"] - STAGE_PERCENT["days"] - 2
            percent = STAGE_PERCENT["days"] + int(span * (max(1, self.day) - 1) / max(1, self.total_days))
        else:
            percent = STAGE_PERCENT[stage]
        self.percent = max(self.percent, percent)
        event: dict[str, Any] = {"stage": stage, "message": self._message(stage), "percent": self.percent}
        if stage == "days":
            event["day"] = max(1, self.day)
            event["total_days"] = self.total_days
        return event

    def advance(self, stage: str) -> dict[str, Any] | None:
        index = STAGE_ORDER.index(stage)
        if index <= self.stage_index:
            return None
        self.stage_index = index
        return self._event(stage)

    def restart(self) -> dict[str, Any]:
        """Forget streamed text (a backup model starts over). Percent never goes backwards."""
        self.buffer = ""
        self._scan_from = 0
        self.day = 0
        self.stage_index = STAGE_ORDER.index("thinking")
        return {"stage": "thinking", "message": "Switching to a backup planner…", "percent": self.percent}

    def feed(self, text: str) -> list[dict[str, Any]]:
        """Append streamed text; return any progress events it unlocks."""
        self.buffer += text
        events: list[dict[str, Any]] = []
        days_index = STAGE_ORDER.index("days")
        last_end = self._scan_from
        for match in _KEY_RE.finditer(self.buffer, self._scan_from):
            last_end = match.end()
            key = match.group(1)
            if key == "days":
                # Enter the days stage silently; the first "activities" key announces day 1.
                if self.stage_index < days_index:
                    self.stage_index = days_index
            elif key == "activities":
                if self.stage_index == days_index and self.day < self.total_days:
                    self.day += 1
                    events.append(self._event("days"))
            else:
                event = self.advance(key)
                if event:
                    events.append(event)
        self._scan_from = max(last_end, len(self.buffer) - _OVERLAP)
        return events


# ── Orchestration ───────────────────────────────────────────────────────────

class Planner:
    def __init__(self, settings: Settings, gemini: GeminiClient | None) -> None:
        self.settings = settings
        self.gemini = gemini

    @property
    def demo_mode(self) -> bool:
        return self.settings.demo

    def ensure_ready(self) -> None:
        if not self.demo_mode and not self.settings.has_key:
            raise PlannerError("missing_api_key", MISSING_KEY_MESSAGE, retryable=False)

    def _prompt(self, req: PlanRequest, budget: BudgetPlan) -> tuple[str, str]:
        return build_prompt(req, budget)

    async def plan(self, req: PlanRequest) -> dict[str, Any]:
        self.ensure_ready()
        started = time.monotonic()
        budget = compute_budget(req)
        if self.demo_mode:
            raw, model = demo.build_raw_plan(req, budget), demo.DEMO_MODEL
            await asyncio.sleep(0.2)
        else:
            assert self.gemini is not None
            system, prompt = self._prompt(req, budget)
            deadline = started + self.settings.request_timeout
            try:
                result = await asyncio.wait_for(
                    self.gemini.generate(system, prompt, RAW_PLAN_SCHEMA, deadline=deadline),
                    timeout=self.settings.request_timeout)
            except GeminiError as err:
                raise PlannerError.from_gemini(err) from err
            except (asyncio.TimeoutError, TimeoutError) as exc:
                raise timeout_error() from exc
            raw, model = parse_model_json(result.text), result.model
        trip = normalize_plan(raw, req, budget, model=model, demo_mode=self.demo_mode,
                              generation_ms=int((time.monotonic() - started) * 1000))
        log.info("Planned %s (%s %s) with %s in %dms", trip["id"], req.duration, req.plan_mode, model,
                 trip["meta"]["generation_ms"])
        return trip

    async def _gemini_chunks(self, req: PlanRequest, budget: BudgetPlan, deadline: float,
                             tracker: "ProgressTracker") -> AsyncIterator[tuple[str, str, str]]:
        """Yield ('text', delta, model) from Gemini, restarting on the next model if a stream dies midway.

        Yields ('restart', model) before a restart so the caller can reset its buffer.
        """
        assert self.gemini is not None
        system, prompt = self._prompt(req, budget)
        models = list(self.settings.models)
        while True:
            model = ""
            source = self.gemini.stream(system, prompt, RAW_PLAN_SCHEMA, deadline=deadline, models=models)
            try:
                async with contextlib.aclosing(source) as chunks:
                    async for chunk in chunks:
                        model = chunk.model
                        yield "text", chunk.text, model
                return
            except GeminiError as err:
                later = models[models.index(model) + 1:] if model in models else []
                left = deadline - time.monotonic()
                if not tracker.buffer or not err.fallback or not later or left < MIN_RESTART_SECONDS:
                    raise
                log.warning("Stream from %s died after %d chars (%s); restarting on %s with %.0fs left",
                            model, len(tracker.buffer), err.detail, later[0], left)
                models = later
                yield "restart", "", later[0]

    async def plan_stream(self, req: PlanRequest) -> AsyncIterator[tuple[str, dict[str, Any]]]:
        """Yield ('progress' | 'result' | 'error', payload) tuples. Never raises PlannerError."""
        started = time.monotonic()
        tracker = ProgressTracker(req)
        yield "progress", tracker.advance("connecting")  # type: ignore[misc]
        try:
            self.ensure_ready()
        except PlannerError as err:
            yield "error", err.to_dict()
            return

        budget = compute_budget(req)
        deadline = started + self.settings.request_timeout
        if self.demo_mode:
            source = _demo_chunks(req, budget)
        else:
            source = self._gemini_chunks(req, budget, deadline, tracker)

        yield "progress", tracker.advance("thinking")  # type: ignore[misc]
        model = ""
        try:
            async with contextlib.aclosing(source) as chunks:
                iterator = chunks.__aiter__()
                while True:
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        raise timeout_error()
                    try:
                        async with asyncio.timeout(remaining):
                            kind, text, model = await iterator.__anext__()
                    except StopAsyncIteration:
                        break
                    except (asyncio.TimeoutError, TimeoutError):
                        raise timeout_error() from None
                    if kind == "restart":
                        yield "progress", tracker.restart()
                        continue
                    for event in tracker.feed(text):
                        yield "progress", event
            yield "progress", tracker.advance("finalizing")  # type: ignore[misc]
            raw = parse_model_json(tracker.buffer)
            trip = normalize_plan(raw, req, budget, model=model, demo_mode=self.demo_mode,
                                  generation_ms=int((time.monotonic() - started) * 1000))
        except GeminiError as err:
            log.warning("Stream failed (%s) after %d chars from %s: %s", err.code, len(tracker.buffer), model or "?", err.detail)
            yield "error", PlannerError.from_gemini(err).to_dict()
            return
        except PlannerError as err:
            yield "error", err.to_dict()
            return
        except Exception:  # noqa: BLE001 - never leak internals to the client
            log.exception("Unexpected error while streaming a plan")
            yield "error", PlannerError("upstream_error", "Something went wrong while planning. Please try again.").to_dict()
            return
        log.info("Streamed %s (%s %s) with %s in %dms", trip["id"], req.duration, req.plan_mode, model,
                 trip["meta"]["generation_ms"])
        yield "result", trip


async def _demo_chunks(req: PlanRequest, budget: BudgetPlan) -> AsyncIterator[tuple[str, str, str]]:
    async for text in demo.stream_raw_plan(req, budget):
        yield "text", text, demo.DEMO_MODEL
