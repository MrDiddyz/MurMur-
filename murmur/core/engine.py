from __future__ import annotations

import time
from pathlib import Path

import ollama

from config import MurmurConfig, get_prompt_path


def _load_prompt(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def _extract_content(response: object) -> str:
    """Extract message content from either a dict (ollama < 0.2) or a ChatResponse object (ollama >= 0.2)."""
    if isinstance(response, dict):
        message = response.get("message", {})
        return str(message.get("content", "")).strip()
    # ollama >= 0.2 returns a ChatResponse object
    message = getattr(response, "message", None)
    if message is None:
        return ""
    content = getattr(message, "content", None)
    return str(content or "").strip()


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
                time.sleep(0.8)
                continue
            break

    raise RuntimeError(
        "Failed to reach Ollama. Ensure the Ollama server is running and the model is available."
    ) from last_error
