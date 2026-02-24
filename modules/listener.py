from __future__ import annotations

import re
from typing import Any

DEFAULT_NICHE = "AI-video i dyre- og menneskebaserte redningshistorier"

GOAL_RULES: tuple[tuple[tuple[str, ...], str], ...] = (
    (("video", "videogenerator", "video generator"), "Bygge en modulær videogenerator"),
    (("sterk prompt", "prompts", "prompt"), "Optimalisere sterke prompt-oppskrifter"),
    (("visuell", "ektehet", "realisme"), "Levere ekstrem visuell ektehet"),
    (("dyr", "mennesker", "rednings"), "Skape unike redningshistorier med dyr og mennesker"),
    (("top 10", "top10", "nisje"), "Etablere top-10 nisjestrategi for dyreinnhold"),
    (("sanntid", "realtime", "real-time"), "Lære og justere i sanntid"),
    (("modul", "modulært"), "Bygge et modulært AI-system"),
    (("optimal", "optimalisme", "optimalisering"), "Gjenbruke sterke videogenerator-mønstre"),
    (("app", "plattform", "system"), "Bygge robust app- og modellsystem"),
    (("high quality", "hq", "ultra", "4k"), "Heve videokvalitet til high-quality nivå"),
    (("andre apper", "andres", "tidligere apper"), "Optimalisere med læring fra eksisterende løsninger"),
    (("eldre", "senior", "pensjonist"), "Tilpasse løsning for eldre brukere"),
    (("trening", "trenings", "aktivitet"), "Bygge treningspartner og motivator"),
    (("motivasjon", "motivere", "oppfølging"), "Øke motivasjon og daglig oppfølging"),
    (("kosthold", "ernæring", "matplan"), "Lage sunt kostholdsoppsett"),
    (("vekt", "vektkontroll", "vektnedgang"), "Støtte vekt- og helseforbedring"),
    # Keep legacy B2B/business triggers for backwards compatibility.
    (("inntekt", "side innkomst", "sideinntekt"), "Bygge stabil sideinntekt"),
    (("automatis", "automatisere", "automatisering"), "Automatisere salgsprosessen"),
    (("logg", "kartlegge", "kartlegging"), "Kartlegge og loggføre forbedringer"),
    (("kjøp", "innkjøp", "procurement"), "Optimalisere digital innkjøpsflyt"),
    (("salg", "salgsflyt", "avtaler"), "Optimalisere digital salgsflyt"),
    (("kontrakt", "nda", "eksklusiv"), "Sikre eksklusive avtaler med NDA"),
)

OBSTACLE_RULES: tuple[tuple[tuple[str, ...], str], ...] = (
    (("kvalitet", "kinematisk", "fotoekte"), "Konsistent fotoekte kvalitet"),
    (("latency", "ytelse", "render"), "Render-hastighet og køhåndtering"),
    (("copyright", "ip", "rettigheter"), "Rettigheter og lisens på modell/input"),
    (("sikkerhet", "moderering", "policy"), "Moderering av sensitivt innhold"),
    (("kostnad", "gpu", "compute"), "GPU-kostnader og effektiv rendering"),
    (("mangler tid", "travelt", "lite tid"), "Begrenset tid"),
    (("skade", "smerte", "skånsom"), "Behov for skånsom progresjon"),
    (("diabetes", "blodtrykk", "kolesterol"), "Helsehensyn må tas i trenings- og kostplan"),
    (("compliance", "juridisk", "konfidensialitet"), "Krav til kontrakt og compliance"),
    (("usikker", "vet ikke", "uklart"), "Utydelig første steg"),
)

SIGNALS = [
    "realtime-learning",
    "modular-system",
    "video-generation",
    "prompt-optimization",
    "cinematic-realism",
    "animal-human-rescue",
    "senior-fitness-coaching",
    "nutrition-planning",
    "model-orchestration",
    "benchmark-optimization",
    "automation",
    "nda-contracts",
    "b2b-deals",
]


def _sanitize_text(value: str) -> str:
    lowered = value.lower().strip()
    return re.sub(r"\s+", " ", lowered)


def _contains_term(normalized_text: str, term: str) -> bool:
    if not term:
        return False
    pattern = rf"(?<!\w){re.escape(term)}(?!\w)"
    return re.search(pattern, normalized_text) is not None


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
        if any(_contains_term(normalized_text, term) for term in terms):
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
        "intent": "build_realtime_modular_video_ai",
        "intent_legacy": "build_realtime_modular_ai",
        "niche": _extract_niche(normalized_text),
        "goals": goals,
        "obstacles": obstacles,
        "signals": SIGNALS,
    }
