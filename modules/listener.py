from __future__ import annotations

import json
from typing import Any, Dict

from openai import OpenAI

client = OpenAI()

LISTENER_RESPONSE_SCHEMA: Dict[str, Any] = {
    "name": "listener_result",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "required": ["intent", "niche", "goals", "obstacles", "signals", "ok"],
        "properties": {
            "intent": {"type": "string"},
            "niche": {"type": "string"},
            "goals": {"type": "array", "items": {"type": "string"}},
            "obstacles": {"type": "array", "items": {"type": "string"}},
            "signals": {"type": "array", "items": {"type": "string"}},
            "ok": {"type": "boolean"},
        },
    },
    "strict": True,
}


def run_listener(user_text: str) -> Dict[str, Any]:
    with open("prompts/listener.txt", "r", encoding="utf-8") as f:
        prompt = f.read()

    niche = _extract_niche(user_text)

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        response_format={"type": "json_schema", "json_schema": LISTENER_RESPONSE_SCHEMA},
        messages=[
            {
                "role": "system",
                "content": (
                    prompt
                    + "\n\nYou must return ONLY valid JSON.\n"
                    + f"Niche context: {niche}\n"
                ),
            },
            {"role": "user", "content": user_text},
        ],
    )

    raw = (resp.choices[0].message.content or "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    return {"ok": False, "error": "invalid_json", "raw": raw, "niche": niche}


def _extract_niche(user_text: str) -> str:
    lowered = user_text.lower().strip()

    if any(k in lowered for k in ["psytrance", "forest", "dark", "kick", "sub"]):
        return "music/psytrance"
    if any(k in lowered for k in ["stripe", "vipps", "checkout", "payment"]):
        return "payments"
    if any(k in lowered for k in ["next", "react", "tsx", "lint", "typescript"]):
        return "web/nextjs"
    if any(k in lowered for k in ["agent", "multi-agent", "murmur", "constellation"]):
        return "murmur/agents"

    return "general"
