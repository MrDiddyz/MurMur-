from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


LOG_PATH = Path("modules/runtime-log.jsonl")
STATE_PATH = Path("modules/runtime-state.json")


@dataclass
class RuntimeState:
    interactions: int
    niche: str
    top_goals: list[str]
    top_obstacles: list[str]
    affect: dict[str, float]


DEFAULT_STATE = RuntimeState(
    interactions=0,
    niche="AI-video i dyre- og menneskebaserte redningshistorier",
    top_goals=[],
    top_obstacles=[],
    affect={},
)


MAX_STATE_ITEMS = 10
AFFECT_BOUNDS: dict[str, tuple[float, float]] = {
    "valence": (-1.0, 1.0),
    "energy": (0.0, 1.0),
    "release_threshold": (0.0, 1.0),
    "stability": (0.0, 1.0),
    "memory_weight": (0.0, 1.0),
}


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _clone_default_state() -> RuntimeState:
    return RuntimeState(
        interactions=DEFAULT_STATE.interactions,
        niche=DEFAULT_STATE.niche,
        top_goals=list(DEFAULT_STATE.top_goals),
        top_obstacles=list(DEFAULT_STATE.top_obstacles),
        affect=dict(DEFAULT_STATE.affect),
    )


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return max(0, int(value))
    except (TypeError, ValueError):
        return default


def _normalize_ranked_items(raw_items: Any) -> list[str]:
    if not isinstance(raw_items, list):
        return []

    normalized: list[str] = []
    seen: set[str] = set()

    for raw in raw_items:
        item = str(raw).strip()
        if not item:
            continue

        key = item.casefold()
        if key in seen:
            continue

        seen.add(key)
        normalized.append(item)
        if len(normalized) >= MAX_STATE_ITEMS:
            break

    return normalized


def _normalize_affect(raw_affect: Any) -> dict[str, float]:
    if not isinstance(raw_affect, dict):
        return {}

    normalized: dict[str, float] = {}
    for key, value in raw_affect.items():
        key_name = str(key).strip()
        bounds = AFFECT_BOUNDS.get(key_name)
        if bounds is None:
            continue

        try:
            numeric_value = float(value)
        except (TypeError, ValueError):
            continue

        lower, upper = bounds
        normalized[key_name] = max(lower, min(upper, numeric_value))

    return normalized


def _append_unique_capped(target: list[str], candidate: str) -> None:
    value = candidate.strip()
    if not value or value in target:
        return

    target.append(value)
    if len(target) > MAX_STATE_ITEMS:
        del target[0]


def _parse_state(data: dict[str, Any]) -> RuntimeState:
    niche_raw = data.get("niche", DEFAULT_STATE.niche)
    niche = str(niche_raw).strip() or DEFAULT_STATE.niche

    return RuntimeState(
        interactions=_safe_int(data.get("interactions", 0)),
        niche=niche,
        top_goals=_normalize_ranked_items(data.get("top_goals", [])),
        top_obstacles=_normalize_ranked_items(data.get("top_obstacles", [])),
        affect=_normalize_affect(data.get("affect", {})),
    )


def load_state() -> RuntimeState:
    if not STATE_PATH.exists():
        return _clone_default_state()

    try:
        data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return _clone_default_state()

    if not isinstance(data, dict):
        return _clone_default_state()

    return _parse_state(data)


def save_state(state: RuntimeState) -> None:
    _ensure_parent(STATE_PATH)
    STATE_PATH.write_text(
        json.dumps(
            {
                "interactions": max(0, state.interactions),
                "niche": state.niche,
                "top_goals": state.top_goals[:MAX_STATE_ITEMS],
                "top_obstacles": state.top_obstacles[:MAX_STATE_ITEMS],
                "affect": _normalize_affect(state.affect),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def append_log(entry: dict[str, Any]) -> None:
    _ensure_parent(LOG_PATH)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def update_from_listener(listener_output: dict[str, Any]) -> RuntimeState:
    state = load_state()
    state.interactions += 1

    for goal in listener_output.get("goals", []):
        _append_unique_capped(state.top_goals, str(goal))

    for obstacle in listener_output.get("obstacles", []):
        _append_unique_capped(state.top_obstacles, str(obstacle))

    niche = listener_output.get("niche")
    if niche:
        state.niche = str(niche)

    affect = listener_output.get("affect")
    if affect:
        normalized = _normalize_affect(affect)
        if normalized:
            state.affect.update(normalized)

    save_state(state)
    return state


def build_log_entry(
    *,
    user_text: str,
    tone: str,
    listener_output: dict[str, Any],
    planner_output: dict[str, Any],
    final_response: str,
) -> dict[str, Any]:
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tone": tone,
        "user_text": user_text,
        "listener": listener_output,
        "planner": planner_output,
        "response": final_response,
    }
