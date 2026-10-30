"""Pydantic v2 models for the public API contract, plus the Gemini responseSchema.

The public contract (PlanRequest / Trip / errors / SSE events) is shared with the
React frontend — see README.md. Field names and enum values must not change.
"""

from __future__ import annotations

import datetime as dt
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

# ── Enums ────────────────────────────────────────────────────────────────────

PlanMode = Literal["days", "hours"]
Companions = Literal["solo", "couple", "friends", "family"]
BudgetTier = Literal["budget", "moderate", "luxury", "ultra"]
Mood = Literal["relaxing", "adventure", "romantic", "cultural", "party"]
Pace = Literal["relaxed", "balanced", "packed"]
TransportPref = Literal["flight", "train", "bus", "car"]
Interest = Literal[
    "beaches", "mountains", "history", "food", "nightlife",
    "shopping", "nature", "art", "wellness", "adventure-sports",
]
Vibe = Literal["chill", "active", "party", "heritage", "romance", "balanced"]
TransportMode = Literal["flight", "train", "bus", "car", "cab", "metro", "scooter", "auto", "ferry", "walk", "other"]
Category = Literal["food", "sight", "nature", "culture", "adventure", "shopping", "nightlife", "wellness", "transit", "stay", "other"]
ErrorCode = Literal[
    "missing_api_key", "rate_limited", "model_unavailable", "invalid_output",
    "timeout", "upstream_error", "bad_request",
]
Stage = Literal["connecting", "thinking", "overview", "stays", "transport", "days", "tips", "finalizing"]

VIBES: tuple[str, ...] = Vibe.__args__  # type: ignore[attr-defined]
TRANSPORT_MODES: tuple[str, ...] = TransportMode.__args__  # type: ignore[attr-defined]
CATEGORIES: tuple[str, ...] = Category.__args__  # type: ignore[attr-defined]

DURATION_LIMITS = {"days": (1, 14), "hours": (2, 12)}
MAX_INTERESTS = 5

PlaceName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]


# ── Request ──────────────────────────────────────────────────────────────────

class PlanRequest(BaseModel):
    """Body of POST /api/plan and POST /api/plan/stream."""

    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    destination: PlaceName
    origin: Annotated[str, StringConstraints(max_length=80)] | None = None
    start_date: dt.date | None = None
    plan_mode: PlanMode = "days"
    duration: int = Field(default=3, ge=1, le=14)
    travelers: int = Field(default=2, ge=1, le=12)
    companions: Companions = "couple"
    budget: BudgetTier = "moderate"
    mood: Mood = "relaxing"
    pace: Pace = "balanced"
    transport: TransportPref = "flight"
    interests: list[Interest] = Field(default_factory=list, max_length=MAX_INTERESTS)

    @field_validator("origin", "start_date", mode="before")
    @classmethod
    def _blank_to_none(cls, value: Any) -> Any:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("start_date", mode="before")
    @classmethod
    def _strict_date(cls, value: Any) -> Any:
        # Accept only YYYY-MM-DD strings (pydantic would also accept timestamps).
        if isinstance(value, (int, float)):
            raise ValueError("must be a date in YYYY-MM-DD format")
        return value

    @field_validator("interests", mode="after")
    @classmethod
    def _dedupe(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(value))

    @model_validator(mode="after")
    def _check_duration(self) -> "PlanRequest":
        low, high = DURATION_LIMITS[self.plan_mode]
        if not low <= self.duration <= high:
            unit = "days" if self.plan_mode == "days" else "hours"
            raise ValueError(f"duration must be between {low} and {high} {unit} when plan_mode is '{self.plan_mode}'")
        return self

    @property
    def has_origin(self) -> bool:
        return bool(self.origin)

    @property
    def total_days(self) -> int:
        return self.duration if self.plan_mode == "days" else 1


# ── Trip (response) ──────────────────────────────────────────────────────────

class Meta(BaseModel):
    model: str
    demo: bool
    currency: Literal["INR"] = "INR"
    generation_ms: int


class Overview(BaseModel):
    title: str
    summary: str
    highlights: list[str]
    vibe: Vibe


class Allocation(BaseModel):
    stay: int
    transport: int
    activities: int


class Estimate(BaseModel):
    stay: int
    transport: int
    activities: int
    total: int


class Budget(BaseModel):
    tier: BudgetTier
    travelers: int
    nights: int
    rooms: int
    total: int
    allocation: Allocation
    estimate: Estimate
    status: Literal["within", "over"]
    delta: int


class Stay(BaseModel):
    name: str
    type: str
    area: str
    highlight: str
    price_per_night: int = Field(ge=0)
    total_cost: int = Field(ge=0)
    rating: float | None = None
    recommended: bool
    over_budget: bool


class TransportOption(BaseModel):
    mode: TransportMode
    title: str
    details: str
    duration: str
    total_cost: int = Field(ge=0)
    recommended: bool
    over_budget: bool


class Activity(BaseModel):
    time: Annotated[str, StringConstraints(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")]
    title: str
    description: str
    area: str
    category: Category
    cost: int = Field(ge=0)
    duration_minutes: int = Field(ge=0)
    maps_query: str


class Day(BaseModel):
    day: int = Field(ge=1)
    title: str
    total_cost: int = Field(ge=0)
    activities: list[Activity] = Field(min_length=1)


class Trip(BaseModel):
    id: Annotated[str, StringConstraints(pattern=r"^[0-9a-f]{12}$")]
    created_at: str
    request: PlanRequest
    meta: Meta
    overview: Overview
    budget: Budget
    stays: list[Stay]
    transport_scope: Literal["intercity", "local"]
    transport: list[TransportOption]
    days: list[Day]
    tips: list[str]


class ErrorBody(BaseModel):
    code: str
    message: str
    retryable: bool


class ErrorResponse(BaseModel):
    error: ErrorBody


class Progress(BaseModel):
    stage: Stage
    message: str
    percent: int = Field(ge=0, le=100)
    day: int | None = None
    total_days: int | None = None


class Health(BaseModel):
    status: Literal["ok"] = "ok"
    model: str
    has_key: bool
    demo: bool


# ── Gemini responseSchema (OpenAPI subset) ───────────────────────────────────
# The model returns a compact "raw plan"; the backend computes budget numbers,
# ids, flags, totals and fills gaps. propertyOrdering makes the JSON stream in
# overview → stays → transport → days → tips order, which drives progress.

def _obj(properties: dict[str, Any], required: list[str] | None = None) -> dict[str, Any]:
    order = list(properties)
    return {"type": "OBJECT", "properties": properties, "required": required or order, "propertyOrdering": order}


def _str(description: str | None = None, enum: tuple[str, ...] | None = None) -> dict[str, Any]:
    schema: dict[str, Any] = {"type": "STRING"}
    if enum:
        schema["enum"] = list(enum)
    if description:
        schema["description"] = description
    return schema


def _int(description: str) -> dict[str, Any]:
    return {"type": "INTEGER", "description": description}


def _arr(items: dict[str, Any]) -> dict[str, Any]:
    # Note: minItems/maxItems make Gemini 3.x reject the request (400 INVALID_ARGUMENT);
    # counts are enforced by the prompt and by normalization instead.
    return {"type": "ARRAY", "items": items}


RAW_ACTIVITY_SCHEMA = _obj({
    "time": _str("Start time, 24-hour HH:MM"),
    "title": _str("Short title naming the specific real place, e.g. 'Breakfast at Artjuna Cafe'"),
    "description": _str("1-2 sentences: what to do or order there and why it fits"),
    "area": _str("Neighbourhood or locality"),
    "category": _str(enum=CATEGORIES),
    "cost": _int("Total INR for the whole group (tickets, food, fees); 0 if free"),
    "duration_minutes": _int("Minutes spent"),
    "maps_query": _str("Google Maps search query: 'Place name, Area, City'"),
})

RAW_PLAN_SCHEMA: dict[str, Any] = _obj({
    "overview": _obj({
        "title": _str("Short trip title, at most 48 characters"),
        "summary": _str("2-3 sentences"),
        "highlights": _arr(_str("A short highlight, under 60 characters")),
        "vibe": _str(enum=VIBES),
    }),
    "stays": _arr(_obj({
        "name": _str("Real, currently operating property name"),
        "type": _str("e.g. Boutique hotel, Resort, Homestay, Hostel"),
        "area": _str("Neighbourhood"),
        "highlight": _str("Why stay here, under 80 characters"),
        "price_per_night": _int("Typical INR price for ONE room for one night"),
        "rating": {"type": "NUMBER", "description": "Typical guest rating out of 5"},
    })),
    "transport": _arr(_obj({
        "mode": _str(enum=TRANSPORT_MODES),
        "title": _str("Operator/route, e.g. 'IndiGo / Air India, DEL → GOI'"),
        "details": _str("One or two practical sentences"),
        "duration": _str("e.g. '2h 30m'"),
        "total_cost": _int("Total INR for the whole group"),
    })),
    "days": _arr(_obj({
        "title": _str("Theme of the day, under 50 characters"),
        "activities": _arr(RAW_ACTIVITY_SCHEMA),
    })),
    "tips": _arr(_str("A practical, specific local tip")),
})
