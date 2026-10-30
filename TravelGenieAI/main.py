"""TravelGenie API — FastAPI app.

Endpoints
  POST /api/plan          → Trip (JSON)
  POST /api/plan/stream   → Server-Sent Events: progress* → result | error
  GET  /api/health        → {status, model, has_key, demo}
  GET  /                  → service status

Run locally:  python main.py            (port 8000, or $PORT)
Production:   uvicorn main:app --host 0.0.0.0 --port $PORT
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from services.gemini import GeminiClient
from services.planner import Planner, PlannerError
from services.schemas import ErrorResponse, Health, PlanRequest, Trip
from settings import Settings, get_settings

VERSION = "4.0.0"
MAX_BODY_BYTES = 16 * 1024
PING_INTERVAL = 10.0

log = logging.getLogger("travelgenie")


# ── Errors ───────────────────────────────────────────────────────────────────

def error_response(status: int, code: str, message: str, retryable: bool) -> JSONResponse:
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message, "retryable": retryable}})


def validation_message(errors: list[dict[str, Any]]) -> str:
    if not errors:
        return "The request is invalid."
    err = errors[0]
    loc = [str(part) for part in err.get("loc", ()) if part != "body" and not isinstance(part, int)]
    field = ".".join(loc)
    kind = err.get("type", "")
    msg = str(err.get("msg", "is invalid")).removeprefix("Value error, ")
    if kind == "json_invalid":
        return "The request body must be valid JSON."
    if kind == "missing":
        return f"'{field}' is required." if field else "A JSON request body is required."
    if kind in ("model_type", "dict_type") and not field:
        return "The request body must be a JSON object."
    if not field:
        return msg[:1].upper() + msg[1:] + ("" if msg.endswith(".") else ".")
    return f"Invalid '{field}': {msg[:1].lower() + msg[1:]}" + ("" if msg.endswith(".") else ".")


class BodySizeLimit:
    """Reject request bodies over `max_bytes` (Content-Length or streamed)."""

    def __init__(self, app: ASGIApp, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = dict(scope.get("headers") or [])
        length = headers.get(b"content-length")
        if length is not None and length.isdigit() and int(length) > self.max_bytes:
            await self._reject(scope, receive, send)
            return
        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    raise StarletteHTTPException(status_code=413)
            return message

        await self.app(scope, limited_receive, send)

    async def _reject(self, scope: Scope, receive: Receive, send: Send) -> None:
        response = error_response(413, "bad_request", "The request body is too large.", False)
        await response(scope, receive, send)


# ── App ──────────────────────────────────────────────────────────────────────

def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        limits = httpx.Limits(max_connections=50, max_keepalive_connections=10)
        async with httpx.AsyncClient(limits=limits, timeout=httpx.Timeout(settings.request_timeout, connect=10.0)) as http:
            gemini = GeminiClient(http, settings) if settings.has_key else None
            app.state.planner = Planner(settings, gemini)
            log.info("TravelGenie API %s ready — models=%s demo=%s has_key=%s timeout=%ss",
                     VERSION, ",".join(settings.models), settings.demo, settings.has_key, settings.request_timeout)
            if not settings.has_key and not settings.demo:
                log.warning("GEMINI_API_KEY is not set — /api/plan will return missing_api_key. "
                            "Set it in TravelGenieAI/.env or run with TRAVELGENIE_DEMO=1.")
            yield

    app = FastAPI(
        title="TravelGenie API",
        description="AI trip planner for India, powered by Google Gemini.",
        version=VERSION,
        lifespan=lifespan,
        responses={422: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    )
    app.state.settings = settings
    app.state.planner = Planner(settings, None)  # replaced in lifespan

    app.add_middleware(BodySizeLimit, max_bytes=MAX_BODY_BYTES)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        max_age=600,
    )

    # Error handlers — every error uses {"error": {code, message, retryable}}
    @app.exception_handler(PlannerError)
    async def _planner_error(_: Request, exc: PlannerError) -> JSONResponse:
        return error_response(exc.status_code, exc.code, exc.message, exc.retryable)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        return error_response(422, "bad_request", validation_message(list(exc.errors())), False)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        codes = {404: ("not_found", "Not found."), 405: ("method_not_allowed", "Method not allowed."),
                 413: ("bad_request", "The request body is too large.")}
        code, message = codes.get(exc.status_code, ("bad_request" if exc.status_code < 500 else "upstream_error",
                                                     str(exc.detail) if exc.status_code < 500 else "Server error."))
        return error_response(exc.status_code, code, message, exc.status_code >= 500)

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception) -> JSONResponse:
        log.exception("Unhandled error", exc_info=exc)
        return error_response(500, "upstream_error", "Something went wrong on our side. Please try again.", True)

    # Routes
    @app.get("/")
    async def root() -> dict[str, Any]:
        return {"status": "ok", "service": "TravelGenie API", "version": VERSION, "docs": "/docs", "health": "/api/health"}

    @app.get("/api/health", response_model=Health)
    async def health() -> Health:
        return Health(model="demo" if settings.demo else settings.gemini_model, has_key=settings.has_key, demo=settings.demo)

    @app.post("/api/plan", response_model=Trip)
    async def plan(req: PlanRequest, request: Request) -> JSONResponse:
        planner: Planner = request.app.state.planner
        trip = await planner.plan(req)
        return JSONResponse(trip)

    @app.post("/api/plan/stream", response_class=StreamingResponse,
              responses={200: {"content": {"text/event-stream": {}}, "description": "progress* then result | error"}})
    async def plan_stream(req: PlanRequest, request: Request) -> StreamingResponse:
        planner: Planner = request.app.state.planner
        planner.ensure_ready()  # missing key → 503 JSON before the stream opens
        return StreamingResponse(
            sse_events(planner, req),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
        )

    return app


def format_sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False, separators=(',', ':'))}\n\n"


async def sse_events(planner: Planner, req: PlanRequest, ping_interval: float = PING_INTERVAL) -> AsyncIterator[str]:
    """Run the planner in its own task and relay its events, with `: ping` keep-alives during long waits."""
    queue: asyncio.Queue[str | None] = asyncio.Queue()

    async def produce() -> None:
        try:
            async for event, data in planner.plan_stream(req):
                await queue.put(format_sse(event, data))
        except Exception:  # noqa: BLE001
            log.exception("Stream producer crashed")
            await queue.put(format_sse("error", {"code": "upstream_error",
                                                 "message": "Something went wrong while planning. Please try again.",
                                                 "retryable": True}))
        finally:
            await queue.put(None)

    task = asyncio.create_task(produce())
    try:
        while True:
            try:
                item = await asyncio.wait_for(queue.get(), timeout=ping_interval)
            except (asyncio.TimeoutError, TimeoutError):
                yield ": ping\n\n"
                continue
            if item is None:
                break
            yield item
    finally:
        if not task.done():
            task.cancel()
        with contextlib.suppress(asyncio.CancelledError, Exception):
            await task


logging.basicConfig(
    level=getattr(logging, get_settings().log_level, logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logging.getLogger("httpx").setLevel(logging.WARNING)

app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
