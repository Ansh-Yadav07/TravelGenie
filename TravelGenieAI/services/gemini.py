"""Async Gemini REST client (generateContent + streamGenerateContent?alt=sse).

- The API key travels in the `x-goog-api-key` header, never in the URL.
- Transient failures (429, 5xx, connect errors) are retried with exponential
  backoff + jitter; after that — or immediately on 404 / "model not available" —
  the next model in the fallback chain is tried.
- If a model rejects `thinkingConfig` (400), the call is retried once without it
  and that model is remembered as "no thinking config".
- Upstream error text is logged server-side only; callers get a GeminiError with
  a user-friendly message.
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import time
from dataclasses import dataclass
from typing import Any, AsyncIterator, Sequence

import httpx

from settings import Settings

log = logging.getLogger("travelgenie.gemini")

API_BASE = "https://generativelanguage.googleapis.com/v1beta"

FIRST_CHUNK_TIMEOUT = 45.0   # seconds to wait for the first streamed bytes / between chunks
CONNECT_TIMEOUT = 10.0
MIN_ATTEMPT_TIME = 4.0       # don't start an attempt with less time than this left
MAX_TRANSIENT_RETRIES = 1    # per model, for 5xx / connect errors (then fall back)
MAX_RATE_LIMIT_RETRIES = 1   # per model, for 429 (quotas are per model → fall back fast)

BLOCKED_FINISH = {"SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "LANGUAGE", "IMAGE_SAFETY"}

MESSAGES = {
    "rate_limited": "TravelGenie is getting a lot of requests right now. Please try again in a minute.",
    "model_unavailable": "The AI planner is busy right now. Please try again in a moment.",
    "upstream_error": "The AI planner ran into a problem. Please try again.",
    "timeout": "Planning took too long. Please try again — shorter trips generate faster.",
    "invalid_output": "The AI returned an incomplete plan. Please try again.",
    "blocked": "The AI couldn't plan this request. Try a different destination or wording.",
    "too_long": "The plan came out too long to finish. Try fewer days or a lighter pace.",
    "bad_key": "The Gemini API key was rejected. Check GEMINI_API_KEY in TravelGenieAI/.env.",
}


class GeminiError(Exception):
    """A failure talking to Gemini, already mapped to a public error code."""

    def __init__(self, code: str, message: str | None = None, *, retryable: bool = True,
                 fallback: bool = True, transient: bool = False, detail: str = "") -> None:
        super().__init__(detail or code)
        self.code = code
        self.message = message or MESSAGES.get(code, MESSAGES["upstream_error"])
        self.retryable = retryable
        self.fallback = fallback      # worth trying the next model?
        self.transient = transient    # worth retrying the same model after a backoff?
        self.detail = detail          # server-side log only


class _ThinkingRejected(Exception):
    pass


@dataclass
class GeminiResult:
    text: str
    model: str


@dataclass
class StreamChunk:
    text: str
    model: str


def _upstream_message(body: str) -> str:
    try:
        return str(json.loads(body).get("error", {}).get("message", ""))[:500]
    except (ValueError, AttributeError):
        return body[:500]


def classify_http_error(status: int, body: str) -> GeminiError | type[_ThinkingRejected]:
    """Map an upstream HTTP error to a GeminiError (or a thinking-config rejection)."""
    msg = _upstream_message(body)
    low = msg.lower()
    detail = f"HTTP {status}: {msg}"
    if status == 400 and ("thinking" in low):
        return _ThinkingRejected
    if status in (400, 401, 403) and ("api key" in low or "api_key" in low or "permission" in low and "key" in low):
        return GeminiError("upstream_error", MESSAGES["bad_key"], retryable=False, fallback=False, detail=detail)
    if status == 404 or (status == 400 and any(s in low for s in ("not found", "no longer available", "not supported", "is not available", "unsupported model"))):
        return GeminiError("model_unavailable", retryable=True, fallback=True, detail=detail)
    if status == 429:
        return GeminiError("rate_limited", retryable=True, fallback=True, transient=True, detail=detail)
    if status in (500, 502, 503, 504):
        return GeminiError("model_unavailable" if status == 503 else "upstream_error", retryable=True, fallback=True,
                           transient=True, detail=detail)
    return GeminiError("upstream_error", retryable=True, fallback=True, detail=detail)


def _texts(payload: dict[str, Any]) -> tuple[str, str | None]:
    """Extract (visible text, finishReason) from one generateContent response/chunk."""
    if "error" in payload:
        err = payload["error"] or {}
        raise classify_http_error(int(err.get("code") or 500), json.dumps(payload))  # type: ignore[misc]
    feedback = payload.get("promptFeedback") or {}
    if feedback.get("blockReason"):
        raise GeminiError("invalid_output", MESSAGES["blocked"], retryable=False, fallback=False,
                          detail=f"prompt blocked: {feedback.get('blockReason')}")
    candidates = payload.get("candidates") or []
    if not candidates:
        return "", None
    cand = candidates[0]
    parts = (cand.get("content") or {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts if isinstance(p, dict) and not p.get("thought"))
    return text, cand.get("finishReason")


def _check_finish(reason: str | None, model: str) -> None:
    if reason in (None, "", "STOP", "FINISH_REASON_UNSPECIFIED"):
        return
    if reason == "MAX_TOKENS":
        raise GeminiError("invalid_output", MESSAGES["too_long"], retryable=True, fallback=False,
                          detail=f"{model}: finishReason MAX_TOKENS")
    if reason in BLOCKED_FINISH:
        raise GeminiError("invalid_output", MESSAGES["blocked"], retryable=False, fallback=False,
                          detail=f"{model}: finishReason {reason}")
    raise GeminiError("invalid_output", retryable=True, fallback=True, detail=f"{model}: finishReason {reason}")


class GeminiClient:
    def __init__(self, http: httpx.AsyncClient, settings: Settings) -> None:
        self.http = http
        self.settings = settings
        self._no_thinking: set[str] = set()

    # ── request body ────────────────────────────────────────────────────────
    def build_body(self, system: str, prompt: str, schema: dict[str, Any], *, thinking: bool) -> dict[str, Any]:
        config: dict[str, Any] = {
            "temperature": self.settings.temperature,
            "maxOutputTokens": self.settings.max_output_tokens,
            "responseMimeType": "application/json",
            "responseSchema": schema,
        }
        if thinking and self.settings.gemini_thinking_level:
            config["thinkingConfig"] = {"thinkingLevel": self.settings.gemini_thinking_level}
        return {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": config,
        }

    def _headers(self) -> dict[str, str]:
        return {"x-goog-api-key": self.settings.gemini_api_key, "Content-Type": "application/json"}

    def _use_thinking(self, model: str) -> bool:
        return bool(self.settings.gemini_thinking_level) and model not in self._no_thinking

    @staticmethod
    def _remaining(deadline: float) -> float:
        return deadline - time.monotonic()

    async def _backoff(self, attempt: int, deadline: float, retry_after: float | None = None) -> bool:
        delay = retry_after if retry_after is not None else min(8.0, 1.0 * 2 ** attempt) + random.uniform(0, 0.6)
        if self._remaining(deadline) - delay < MIN_ATTEMPT_TIME * 2:
            return False
        await asyncio.sleep(delay)
        return True

    # ── shared retry / fallback loop ───────────────────────────────────────
    async def _run_chain(self, deadline: float, attempt_fn, models: Sequence[str] | None = None):
        """Run attempt_fn(model, thinking, timeout) across the fallback chain.

        attempt_fn is an async generator; anything it yields is passed through.
        A failure after it has yielded something is not retried (raised as-is).
        """
        chain = list(models) if models is not None else list(self.settings.models)
        last: GeminiError | None = None
        for index, model in enumerate(chain):
            transient = rate = 0
            thinking_retry_done = False
            while True:
                remaining = self._remaining(deadline)
                if remaining < MIN_ATTEMPT_TIME:
                    raise GeminiError("timeout", retryable=True, detail="deadline reached before attempt")
                thinking = self._use_thinking(model)
                yielded = False
                started = time.monotonic()
                try:
                    async for item in attempt_fn(model, thinking, remaining):
                        yielded = True
                        yield item
                    return
                except _ThinkingRejected:
                    log.warning("%s rejected thinkingConfig; retrying without it", model)
                    self._no_thinking.add(model)
                    if thinking_retry_done:
                        last = GeminiError("upstream_error", detail=f"{model}: thinking config rejected twice")
                        break
                    thinking_retry_done = True
                    continue
                except GeminiError as err:
                    if yielded:
                        raise
                    last = err
                    log.warning("Gemini %s failed after %.1fs: %s (%s)", model, time.monotonic() - started, err.code, err.detail)
                    if not err.fallback:
                        raise
                    if err.code == "rate_limited" and rate < MAX_RATE_LIMIT_RETRIES and index == len(chain) - 1:
                        # Last model in the chain: worth waiting a little for the quota window.
                        rate += 1
                        if await self._backoff(rate, deadline):
                            continue
                    elif err.transient and err.code != "rate_limited" and transient < MAX_TRANSIENT_RETRIES:
                        transient += 1
                        if await self._backoff(transient - 1, deadline):
                            continue
                    break
                except (httpx.ConnectError, httpx.ConnectTimeout, httpx.RemoteProtocolError, httpx.ReadError) as exc:
                    if yielded:
                        raise GeminiError("upstream_error", detail=f"{model}: connection lost mid-stream: {exc!r}") from exc
                    last = GeminiError("upstream_error", detail=f"{model}: {exc!r}")
                    log.warning("Gemini %s connection problem: %r", model, exc)
                    if transient < 1:
                        transient += 1
                        if await self._backoff(0, deadline):
                            continue
                    break
                except (httpx.ReadTimeout, httpx.WriteTimeout, httpx.PoolTimeout) as exc:
                    if yielded:
                        raise GeminiError("timeout", detail=f"{model}: stalled mid-stream") from exc
                    last = GeminiError("timeout", detail=f"{model}: no response after {time.monotonic() - started:.1f}s")
                    log.warning("Gemini %s timed out after %.1fs", model, time.monotonic() - started)
                    break
            if index + 1 < len(chain):
                log.info("Falling back from %s to %s", model, chain[index + 1])
        raise last or GeminiError("model_unavailable", detail="no models configured")

    # ── non-streaming ───────────────────────────────────────────────────────
    async def generate(self, system: str, prompt: str, schema: dict[str, Any], *, deadline: float) -> GeminiResult:
        async def attempt(model: str, thinking: bool, remaining: float):
            body = self.build_body(system, prompt, schema, thinking=thinking)
            timeout = httpx.Timeout(remaining, connect=min(CONNECT_TIMEOUT, remaining))
            started = time.monotonic()
            resp = await self.http.post(f"{API_BASE}/models/{model}:generateContent",
                                        headers=self._headers(), json=body, timeout=timeout)
            if resp.status_code != 200:
                raise classify_http_error(resp.status_code, resp.text)  # type: ignore[misc]
            try:
                payload = resp.json()
            except ValueError as exc:
                raise GeminiError("upstream_error", detail=f"{model}: non-JSON response") from exc
            text, finish = _texts(payload)
            _check_finish(finish, model)
            if not text.strip():
                raise GeminiError("invalid_output", detail=f"{model}: empty response")
            usage = payload.get("usageMetadata") or {}
            log.info("Gemini %s generateContent ok in %.1fs (prompt=%s out=%s thoughts=%s)", model,
                     time.monotonic() - started, usage.get("promptTokenCount"),
                     usage.get("candidatesTokenCount"), usage.get("thoughtsTokenCount"))
            yield GeminiResult(text=text, model=model)

        result: GeminiResult | None = None
        async for item in self._run_chain(deadline, attempt):
            result = item
        if result is None:  # pragma: no cover - the chain either yields or raises
            raise GeminiError("upstream_error", detail="no result")
        return result

    # ── streaming ───────────────────────────────────────────────────────────
    async def stream(self, system: str, prompt: str, schema: dict[str, Any], *, deadline: float,
                     models: Sequence[str] | None = None) -> AsyncIterator[StreamChunk]:
        """Yield text deltas. Falls back to the next model only before any text arrives
        (a failure after that is raised; the planner decides whether to restart)."""

        async def attempt(model: str, thinking: bool, remaining: float):
            body = self.build_body(system, prompt, schema, thinking=thinking)
            read = min(FIRST_CHUNK_TIMEOUT, remaining)
            timeout = httpx.Timeout(read, connect=min(CONNECT_TIMEOUT, remaining))
            started = time.monotonic()
            first_at: float | None = None
            finish: str | None = None
            usage: dict[str, Any] = {}
            got_text = False
            async with self.http.stream("POST", f"{API_BASE}/models/{model}:streamGenerateContent?alt=sse",
                                        headers=self._headers(), json=body, timeout=timeout) as resp:
                if resp.status_code != 200:
                    raw = (await resp.aread()).decode("utf-8", "replace")
                    raise classify_http_error(resp.status_code, raw)  # type: ignore[misc]
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if not data or data == "[DONE]":
                        continue
                    try:
                        payload = json.loads(data)
                    except ValueError:
                        log.warning("Gemini %s sent an unparseable SSE line (%d bytes)", model, len(data))
                        continue
                    text, reason = _texts(payload)
                    finish = reason or finish
                    usage = payload.get("usageMetadata") or usage
                    if text:
                        if first_at is None:
                            first_at = time.monotonic() - started
                        got_text = True
                        yield StreamChunk(text=text, model=model)
            _check_finish(finish, model)
            if not got_text:
                raise GeminiError("invalid_output", detail=f"{model}: stream ended without text")
            log.info("Gemini %s stream ok: first text %.1fs, total %.1fs (prompt=%s out=%s thoughts=%s)", model,
                     first_at or 0, time.monotonic() - started, usage.get("promptTokenCount"),
                     usage.get("candidatesTokenCount"), usage.get("thoughtsTokenCount"))

        async for chunk in self._run_chain(deadline, attempt, models):
            yield chunk
