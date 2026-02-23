from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, Optional

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None  # type: ignore[assignment]

DEFAULT_LISTENER_PROMPT = (
    "You are the MurMur listener module."
    " Return a compact JSON object describing intent, sentiment, and key topics."
)


def run_listener(user_text: str, *, client: Optional[Any] = None) -> Dict[str, Any]:
    prompt = _load_listener_prompt()
    niche = _extract_niche(user_text)

    if client is not None:
        active_client = client
    else:
        if OpenAI is None:
            raise RuntimeError("openai package is not installed; provide a client explicitly.")
        active_client = OpenAI()
    resp = active_client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    prompt
                    + "\n\nYou must return ONLY valid JSON.\n"
                    + f"Niche: {niche}"
                ),
            },
            {
                "role": "user",
                "content": user_text,
            },
        ],
    )

    raw = (resp.choices[0].message.content or "").strip()
    parsed = _parse_json_object(raw)
    if parsed is not None:
        return parsed

    return {"ok": False, "raw": raw, "niche": niche}


def _load_listener_prompt(path: str = "prompts/listener.txt") -> str:
    prompt_path = Path(path)
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return DEFAULT_LISTENER_PROMPT


def _parse_json_object(raw: str) -> Optional[Dict[str, Any]]:
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        return None

    return None


def _extract_niche(user_text: str) -> str:
    lowered = user_text.lower()

    if "psytrance" in lowered:
        return "psytrance"
    if "nextjs" in lowered or "tsx" in lowered:
        return "nextjs"

    return "general"
