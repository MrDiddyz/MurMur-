from __future__ import annotations

from openai import OpenAI
from .config import get_settings


def get_openai() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("Missing OPENAI_API_KEY")
    return OpenAI(api_key=settings.openai_api_key)
