"""Runtime configuration, read from the environment (and TravelGenieAI/.env via python-dotenv).

Environment variables
---------------------
GEMINI_API_KEY          Google AI Studio key. Required unless TRAVELGENIE_DEMO=1.
GEMINI_MODEL            Primary model (default: gemini-3.5-flash-lite).
GEMINI_FALLBACK_MODELS  Comma-separated models tried in order when the primary is
                        unavailable, rate limited or overloaded.
GEMINI_THINKING_LEVEL   thinkingConfig.thinkingLevel sent to Gemini 3 models
                        (minimal | low | medium | high, default low; empty = omit).
TRAVELGENIE_DEMO        1/true to serve a deterministic demo trip without calling Gemini.
ALLOWED_ORIGINS         Comma-separated CORS origins (default "*").
REQUEST_TIMEOUT         Overall per-request budget in seconds (default 120).
LOG_LEVEL               Python logging level (default INFO).
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Values already present in the real environment win over the .env file.
load_dotenv(BASE_DIR / ".env", override=False)

DEFAULT_MODEL = "gemini-3.5-flash-lite"
DEFAULT_FALLBACK_MODELS = ("gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-lite-latest")


def _split(value: str | None) -> list[str]:
    return [part.strip() for part in (value or "").split(",") if part.strip()]


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def _float(value: str | None, default: float) -> float:
    try:
        parsed = float(value) if value not in (None, "") else default
    except ValueError:
        return default
    return parsed if parsed > 0 else default


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = ""
    gemini_model: str = DEFAULT_MODEL
    gemini_fallback_models: tuple[str, ...] = DEFAULT_FALLBACK_MODELS
    gemini_thinking_level: str = "low"
    demo: bool = False
    allowed_origins: tuple[str, ...] = ("*",)
    request_timeout: float = 120.0
    log_level: str = "INFO"
    max_output_tokens: int = 32768
    temperature: float = 0.7
    models: tuple[str, ...] = field(init=False)

    def __post_init__(self) -> None:
        chain: list[str] = []
        for name in (self.gemini_model, *self.gemini_fallback_models):
            name = name.removeprefix("models/")
            if name and name not in chain:
                chain.append(name)
        object.__setattr__(self, "models", tuple(chain))

    @property
    def has_key(self) -> bool:
        return bool(self.gemini_api_key)


def load_settings() -> Settings:
    env = os.environ
    fallbacks = env.get("GEMINI_FALLBACK_MODELS")
    return Settings(
        gemini_api_key=(env.get("GEMINI_API_KEY") or "").strip(),
        gemini_model=(env.get("GEMINI_MODEL") or DEFAULT_MODEL).strip(),
        gemini_fallback_models=tuple(_split(fallbacks)) if fallbacks is not None else DEFAULT_FALLBACK_MODELS,
        gemini_thinking_level=(env.get("GEMINI_THINKING_LEVEL", "low") or "").strip().lower(),
        demo=_truthy(env.get("TRAVELGENIE_DEMO")),
        allowed_origins=tuple(_split(env.get("ALLOWED_ORIGINS"))) or ("*",),
        request_timeout=_float(env.get("REQUEST_TIMEOUT"), 120.0),
        log_level=(env.get("LOG_LEVEL") or "INFO").strip().upper(),
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return load_settings()
