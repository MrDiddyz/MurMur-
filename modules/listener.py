from __future__ import annotations

import json
import re
from typing import Any, Dict

from openai import OpenAI

client = OpenAI()


def run_listener(user_text: str) -> Dict[str, Any]:
    with open("prompts/listener.txt", "r", encoding="utf-8") as f:
        prompt = f.read()

    niche = _extract_niche(user_text)

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        response_format={"type": "json_object"},
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
    except Exception:
        pass

    m = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
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
