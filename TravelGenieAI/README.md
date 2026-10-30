# TravelGenie API

FastAPI backend for TravelGenie, an AI trip planner for India. It turns a short trip request into a full itinerary with real places, stays, transport options, a day-by-day plan and a budget check, using Google Gemini.

```
budget.py  →  prompt.py  →  gemini.py (stream / generate, retries, fallback)  →  planner.py (validate + normalize)  →  Trip
```

## Setup

```bash
cd TravelGenieAI
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt     # runtime deps + pytest
cp .env.example .env                              # then set GEMINI_API_KEY
.venv/bin/python main.py                          # http://localhost:8000  (docs at /docs)
```

To run it without a key, use demo mode: `TRAVELGENIE_DEMO=1 .venv/bin/python main.py`.

Tests: `.venv/bin/python -m pytest`

Production (Heroku-style): `Procfile` runs `uvicorn main:app --host 0.0.0.0 --port $PORT`, and `runtime.txt` pins Python 3.11. The code also runs on Python 3.11–3.14.

In development, the Vite dev server proxies `/api` to `localhost:8000`. In production, set `VITE_API_URL` in the frontend and `ALLOWED_ORIGINS` here.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Google AI Studio key. Required unless demo mode is on. Sent only in the `x-goog-api-key` header. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Primary model. |
| `GEMINI_FALLBACK_MODELS` | `gemini-3.1-flash-lite,gemini-3.6-flash,gemini-3.5-flash,gemini-flash-lite-latest` | Comma list, tried in order. Set it to an empty string to disable fallback. |
| `GEMINI_THINKING_LEVEL` | `low` | Sent as `thinkingConfig.thinkingLevel`. Leave empty to omit it. |
| `TRAVELGENIE_DEMO` | off | `1` serves a deterministic demo trip and never calls Gemini. |
| `ALLOWED_ORIGINS` | `*` | Comma list of CORS origins. |
| `REQUEST_TIMEOUT` | `120` | Total time budget per request, in seconds. When it runs out, the request fails with `timeout`. |
| `LOG_LEVEL` | `INFO` | Python logging level. |

`.env` is read with python-dotenv from this folder. Real environment variables take precedence over it.

## Endpoints

| Method | Path | Returns |
|---|---|---|
| `POST` | `/api/plan` | `Trip` JSON |
| `POST` | `/api/plan/stream` | `text/event-stream`: `progress`… then `result` or `error` |
| `GET` | `/api/health` | `{ "status": "ok", "model": "gemini-…", "has_key": true, "demo": false }` |
| `GET` | `/` | Service status JSON |

Request bodies are capped at 16 KB.

## API contract

All money is INR, as integers, and covers the **whole group**. The base path is `/api`.

### Request body: `PlanRequest` (both POST endpoints)

```jsonc
{
  "destination": "Goa",                // 1–80 chars, required
  "origin": "Delhi",                   // optional (null) — starting city
  "start_date": "2026-12-20",          // optional (null), YYYY-MM-DD
  "plan_mode": "days",                 // "days" | "hours"
  "duration": 4,                       // days 1–14, hours 2–12
  "travelers": 2,                      // 1–12
  "companions": "couple",              // solo | couple | friends | family
  "budget": "moderate",                // budget | moderate | luxury | ultra
  "mood": "relaxing",                  // relaxing | adventure | romantic | cultural | party
  "pace": "balanced",                  // relaxed | balanced | packed
  "transport": "flight",               // flight | train | bus | car (preferred intercity mode)
  "interests": ["beaches", "food"]     // ≤5 of: beaches mountains history food nightlife shopping nature art wellness adventure-sports
}
```

Omitted optional fields fall back to these defaults: `plan_mode` `days`, `duration` 3, `travelers` 2, `companions` `couple`, `budget` `moderate`, `mood` `relaxing`, `pace` `balanced`, `transport` `flight`, `interests` `[]`. Empty strings for `origin` and `start_date` become `null`. Unknown fields are ignored.

### Response: `Trip`

```jsonc
{
  "id": "a1b2c3d4e5f6",                       // 12-char hex
  "created_at": "2026-10-30T12:00:00Z",
  "request": { /* PlanRequest, normalized */ },
  "meta": { "model": "gemini-…", "demo": false, "currency": "INR", "generation_ms": 18234 },
  "overview": {
    "title": "4 sunny days in Goa",                       // ≤ 48 chars
    "summary": "Two or three sentences describing the trip.",
    "highlights": ["Sunset at Chapora Fort", "..."],      // 3–5 short strings
    "vibe": "chill"                                       // chill | active | party | heritage | romance | balanced
  },
  "budget": {
    "tier": "moderate", "travelers": 2, "nights": 3, "rooms": 1,
    "total": 48000,
    "allocation": { "stay": 15000, "transport": 16000, "activities": 24000 },
    "estimate":   { "stay": 13500, "transport": 14200, "activities": 11800, "total": 39500 },
    "status": "within",                                   // within | over
    "delta": 8500                                         // total - estimate.total (negative when over)
  },
  "stays": [                                              // 3 options in days mode, [] in hours mode; recommended first
    { "name": "Real hotel name", "type": "Boutique hotel", "area": "Candolim",
      "highlight": "Rooftop pool, 5 min walk to the beach", "price_per_night": 4500,
      "total_cost": 13500, "rating": 4.4, "recommended": true, "over_budget": false }
  ],
  "transport_scope": "intercity",                         // "intercity" when origin given (days mode), else "local"
  "transport": [                                          // 3–5 options, recommended first
    { "mode": "flight", "title": "IndiGo / Air India, DEL → GOI", "details": "Daily non-stop flights …",
      "duration": "2h 30m", "total_cost": 14200, "recommended": true, "over_budget": false }
  ],                                                      // mode: flight train bus car cab metro scooter auto ferry walk other
  "days": [                                               // `duration` items in days mode; exactly 1 in hours mode
    { "day": 1, "title": "North Goa beaches & sunset forts", "total_cost": 3200,
      "activities": [
        { "time": "09:00", "title": "Breakfast at Artjuna Cafe", "description": "What you'll do there…",
          "area": "Anjuna", "category": "food", "cost": 900, "duration_minutes": 60,
          "maps_query": "Artjuna Cafe, Anjuna, Goa" }
      ] }
  ],                                                      // category: food sight nature culture adventure shopping nightlife wellness transit stay other
  "tips": ["Rent a scooter…", "..."]                      // 3–6 practical local tips
}
```

Notes:
- `rating` may be `null` when the model gives no usable rating.
- In hours mode, `transport_scope` is always `"local"`, even when `origin` is set. Hours plans don't include intercity travel, and the budget formula ignores `origin` in that mode.
- The counts in the comments (3 stays, 3–5 transport options, 3–6 tips, 3–5 highlights) are what the model is asked for. The backend enforces the maximums. If the model returns fewer, the backend accepts them and never invents filler. The only exceptions are `days`, which must match `duration`, and `stays` and `transport`, which can't be empty. If any of those fail, the request fails with `invalid_output`.

### SSE (`POST /api/plan/stream`, `text/event-stream`)

```
event: progress
data: {"stage":"days","message":"Planning day 2 of 4…","percent":45,"day":2,"total_days":4}

event: result
data: { …Trip… }

event: error
data: {"code":"timeout","message":"User-friendly sentence.","retryable":true}
```

- `stage` is one of `connecting | thinking | overview | stays | transport | days | tips | finalizing`. `percent` always increases (0–100) and never reaches 100 before `result`. `day` and `total_days` appear only on `days` events.
- Progress is real. It comes from the JSON Gemini is writing, which streams in this order: overview → stays → transport → days → tips. The backend detects each top-level key and counts the `"activities"` keys to report the current day.
- During long waits, the server sends a `: ping` comment every 10 s. Responses carry `Cache-Control: no-cache` and `X-Accel-Buffering: no`.
- Request validation and `missing_api_key` errors return as plain HTTP JSON errors (below) before the stream opens.
- Error codes: `missing_api_key | rate_limited | model_unavailable | invalid_output | timeout | upstream_error | bad_request`.

### Errors (non-stream)

```json
{ "error": { "code": "bad_request", "message": "Invalid 'budget': input should be 'budget', 'moderate', 'luxury' or 'ultra'.", "retryable": false } }
```

| Code | HTTP | Retryable |
|---|---|---|
| `bad_request` | 422 (413 if the body is too large) | no |
| `missing_api_key` | 503 | no |
| `rate_limited` | 429 | yes |
| `model_unavailable` | 503 | yes |
| `invalid_output` | 502 | yes (no for safety blocks) |
| `timeout` | 504 | yes |
| `upstream_error` | 502 / 500 | yes (no for a rejected API key) |

Unknown routes return `404 {"error": {"code": "not_found", …}}`. Clients never see raw upstream error text. The details go to server logs, through the `logging` module.

## Budget model

`services/budget.py` is the authoritative copy. `src/lib/planner.js` `computeBudget` mirrors it, so keep the two identical.

| Tier | room_per_night | daily_per_person | intercity_per_person |
|---|---|---|---|
| budget | 1800 | 1500 | 3000 |
| moderate | 5000 | 3000 | 8000 |
| luxury | 15000 | 7000 | 16000 |
| ultra | 40000 | 15000 | 40000 |

`round100` rounds to the nearest 100, with halves rounded up, matching JS `Math.round(n / 100) * 100`.

- **Days mode:** `nights = max(1, duration-1)`, `rooms = ceil(travelers/2)`, `stay = round100(rooms·nights·room)`, `activities = round100(travelers·duration·daily)`, `transport = origin ? round100(travelers·intercity) : round100(travelers·duration·daily·0.25)`.
- **Hours mode:** `share = min(1, duration/8)`, `activities = round100(travelers·daily·share)`, `transport = round100(travelers·daily·0.25·share)`, `stay = nights = rooms = 0`.
- `total = stay + transport + activities`.
- **Estimate:** `stay` is the recommended stay's `total_cost`, `transport` is the recommended option's `total_cost`, and `activities` is the sum of all activity costs. `status` is `"over"` when `estimate.total > total`, and `delta = total − estimate.total`.

The model returns only a compact "raw plan": a per-room `price_per_night` for each stay, a group `total_cost` for each transport option, and activities. The backend then computes or normalizes everything else:
- **Derived fields:** stay `total_cost = price_per_night × rooms × nights`, `recommended` and `over_budget` flags, and day totals.
- **IDs and timestamps:** the trip `id` and `created_at`.
- **Activity fields:** times become 24-hour `HH:MM` and are sorted. Costs are clamped to non-negative integers. Empty activities are dropped. A missing `maps_query` falls back to `"{title}, {area}, {destination}"`.
- **Enums:** synonyms such as `taxi` → `cab` and `restaurant` → `food` are mapped to the contract enums.
- **Text limits:** the overview title is trimmed to 48 characters.

Recommendation rules:
- **Stay:** the priciest option within the stay allocation, or the cheapest one if none fit.
- **Transport:** in intercity scope, an option in the user's preferred mode that fits the allocation. Otherwise, the first option that fits. If none fit, the cheapest. Recommended options are listed first.

## Gemini: model choice, retries and fallback

The key goes only in the `x-goog-api-key` header, never in the URL. Every request uses `responseMimeType: application/json` and a `responseSchema` (OpenAPI subset, uppercase types, `enum`s, and `propertyOrdering` so the JSON streams in order). Generation uses temperature 0.7 and `maxOutputTokens` 32768. Note that `minItems`/`maxItems` make Gemini 3.x reject the request with a 400, so the schema leaves them out.

**Measured on 2026-10-30** with this project's key, using a 3-day Goa trip from Delhi through `streamGenerateContent?alt=sse`:

| Model | Result |
|---|---|
| `gemini-3.5-flash-lite` | 5/5 OK. First text ≈1.5 s, full plan 6.5–7 s. A 6-hour plan takes ≈3.3 s, 5 days ≈12 s, and 14 days ≈22 s (9.7k output tokens). |
| `gemini-3.1-flash-lite` | 3/3 OK, ≈7–8.5 s. Slightly weaker place choices. |
| `gemini-3.6-flash` | 1 of 4 OK (14 s, the richest output). The other three hit 503 "high demand" mid-stream. |
| `gemini-3.5-flash` | 0 of 3. All failed with 503 mid-stream. |
| `gemini-3.7-flash`, `gemini-flash-latest` | No response within 45 s. |
| `gemini-3.8-flash` | 503s, taking 5–36 s each. |
| `gemini-2.5-flash` | 404 "no longer available to new users". |

Plain `generateContent` works with this key, so the Interactions API wasn't needed. `thinkingConfig.thinkingLevel: "low"` is accepted by the Gemini 3.x models. If a model rejects it with a 400, the client retries once without it and remembers that model. When capacity allows, `GEMINI_MODEL=gemini-3.6-flash` gives slightly richer plans at roughly twice the latency.

**Retry and fallback rules** (`services/gemini.py`):
- **404 or "model not available":** fall back to the next model immediately.
- **429:** fall back immediately, since quotas are per model. On the last model, wait once with backoff, then fail with `rate_limited`.
- **5xx/503 and connect errors:** retry the same model once with exponential backoff plus jitter, then fall back.
- **No bytes within 45 s:** move to the next model.
- **Stream dies after text has started:** the planner restarts on the next model, provided at least 25 s of the request budget remain. The client sees a `thinking` progress event ("Switching to a backup planner…") and `percent` holds steady. Without enough time or another model, the client gets an `error` event (retryable).
- **Overall cap:** the whole request is limited by `REQUEST_TIMEOUT`.

## Demo mode

With `TRAVELGENIE_DEMO=1`, the API never calls Gemini. `services/demo.py` builds a raw plan in exactly the model's format:
- **Goa:** curated real places, with stays priced to fit the tier.
- **Any other destination:** a clearly labelled sample itinerary.

It then streams the JSON in small chunks over about 5–6 s, through the same progress tracker and normalizer as real plans. This lets you exercise the frontend's progress UI, result page and budget logic without a key. `meta.demo` is `true` and `meta.model` is `"demo"`.

## Layout

```
main.py              app factory, CORS, body-size limit, error handlers, routes, SSE relay with pings
settings.py          env config (python-dotenv)
services/schemas.py  Pydantic request/response models + Gemini responseSchema
services/budget.py   budget model
services/prompt.py   prompt builder (+ input sanitization)
services/gemini.py   async httpx client: generate / stream, retries, fallback
services/planner.py  orchestration, normalization, streaming progress
services/demo.py     deterministic demo trips
tests/               pytest suite (budget, normalization, schema, SSE progress, API, fallback)
```
