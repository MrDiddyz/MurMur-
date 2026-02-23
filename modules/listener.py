from __future__ import annotations

import re
from typing import Any

DEFAULT_NICHE = "lead-generering for lokale tjenestebedrifter"

GOAL_RULES: tuple[tuple[tuple[str, ...], str], ...] = (
    (("inntekt", "side innkomst", "sideinntekt"), "Bygge stabil sideinntekt"),
    (("automatis", "automatisere", "automatisering"), "Automatisere salgsprosessen"),
    (("logg", "kartlegge", "kartlegging"), "Kartlegge og loggføre forbedringer"),
)

OBSTACLE_RULES: tuple[tuple[tuple[str, ...], str], ...] = (
    (("tid", "travelt", "mangler tid"), "Begrenset tid"),
    (("usikker", "vet ikke", "uklart"), "Utydelig første steg"),
)

SIGNALS = ["realtime-learning", "modular-system", "automation"]


def _sanitize_text(value: str) -> str:
    lowered = value.lower().strip()
    return re.sub(r"\s+", " ", lowered)


def _extract_niche(user_text: str) -> str:
    normalized = _sanitize_text(user_text)

    patterns = (
        r"nisje(?:\s+som)?\s+([\wæøå\-\s]{3,80})",
        r"for\s+([\wæøå\-\s]{3,80})",
    )

    for pattern in patterns:
        match = re.search(pattern, normalized)
        if not match:
            continue

        niche = match.group(1).strip(" .,!?:;")
        niche = re.split(r"\b(og|som|for å|mot)\b", niche, maxsplit=1)[0].strip()
        if niche:
            return niche

    return DEFAULT_NICHE


def _collect_rules(normalized_text: str, rules: tuple[tuple[tuple[str, ...], str], ...]) -> list[str]:
    matches: list[str] = []
    for terms, label in rules:
        if any(term in normalized_text for term in terms):
            matches.append(label)
    return matches


def run_listener(user_text: str) -> dict[str, Any]:
    normalized_text = _sanitize_text(user_text)

    goals = _collect_rules(normalized_text, GOAL_RULES)
    obstacles = _collect_rules(normalized_text, OBSTACLE_RULES)

    if not goals:
        goals = ["Bygge en skalerbar sideinntekt"]
    if not obstacles:
        obstacles = ["Utydelig første steg"]

    return {
        "intent": "build_realtime_modular_ai",
        "niche": _extract_niche(normalized_text),
        "goals": goals,
        "obstacles": obstacles,
        "signals": SIGNALS,
    }
