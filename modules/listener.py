from __future__ import annotations

import json
import re
from typing import Any

from openai import OpenAI

client = OpenAI()


def run_listener(user_text: str) -> dict[str, Any]:
    with open("prompts/listener.txt", "r", encoding="utf-8") as f:
        prompt = f.read()

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_text},
        ],
        response_format={"type": "json_object"},
    )

    content = (resp.choices[0].message.content or "{}").strip()
    return json.loads(content)


def _extract_niche(user_text: str) -> str:
    lowered = user_text.lower().strip()

    patterns = [
        "psytrance",
        "ai",
        "fitness",
        "business",
        "music",
        "coaching",
        "marketing",
    ]

    for p in patterns:
        if re.search(rf"(?<!\\w){re.escape(p)}(?!\\w)", lowered):
            return p

    return "general"
