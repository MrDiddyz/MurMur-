from __future__ import annotations

import time
from pathlib import Path

import ollama

from config import MurmurConfig, get_prompt_path

_RETRY_BASE_DELAY = 1.0  # seconds — doubles on each retry (exponential backoff)


def _load_prompt(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def _extract_content(response: object) -> str:
    """Return the assistant message content from an ollama response.

    ollama < 0.2 returns a plain dict; ollama >= 0.2 returns a ChatResponse
    Pydantic model.  Both are handled here so callers need not care.
    """
    if isinstance(response, dict):
        message = response.get("message", {})
        return str(message.get("content", "")).strip()
    # ChatResponse object (ollama >= 0.2): has .message.content
    message = getattr(response, "message", None)
    if message is None:
        return ""
    return str(getattr(message, "content", "") or "").strip()


def run_murmur(prompt: str) -> str:
    config = MurmurConfig()
    system_prompt = _load_prompt(get_prompt_path(config.prompt_mode))

    last_error: Exception | None = None
    for attempt in range(config.max_retries + 1):
        try:
            response = ollama.chat(
                model=config.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            )
            return _extract_content(response)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < config.max_retries:
                # Exponential backoff: 1s, 2s, 4s, …
                time.sleep(_RETRY_BASE_DELAY * (2 ** attempt))
                continue
            break

    raise RuntimeError(
        "Failed to reach Ollama. Ensure the Ollama server is running and the model is available."
    ) from last_error
