from __future__ import annotations

import time
from pathlib import Path

import ollama

from config import MurmurConfig, get_prompt_path


def _load_prompt(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


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
            message = response.get("message", {})
            return str(message.get("content", "")).strip()
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < config.max_retries:
                time.sleep(0.8)
                continue
            break

    raise RuntimeError(
        "Failed to reach Ollama. Ensure the Ollama server is running and the model is available."
    ) from last_error
