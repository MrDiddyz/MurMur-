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


DEFAULT_STATE = RuntimeState(
    interactions=0,
    niche="AI-video i dyre- og menneskebaserte redningshistorier",
    top_goals=[],
    top_obstacles=[],
)


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _clone_default_state() -> RuntimeState:
    return RuntimeState(
        interactions=DEFAULT_STATE.interactions,
        niche=DEFAULT_STATE.niche,
        top_goals=list(DEFAULT_STATE.top_goals),
        top_obstacles=list(DEFAULT_STATE.top_obstacles),
    )


def load_state() -> RuntimeState:
    if not STATE_PATH.exists():
        return _clone_default_state()

    data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return RuntimeState(
        interactions=int(data.get("interactions", 0)),
        niche=str(data.get("niche", DEFAULT_STATE.niche)),
        top_goals=list(data.get("top_goals", [])),
        top_obstacles=list(data.get("top_obstacles", [])),
    )


def save_state(state: RuntimeState) -> None:
    _ensure_parent(STATE_PATH)
    STATE_PATH.write_text(
        json.dumps(
            {
                "interactions": state.interactions,
                "niche": state.niche,
                "top_goals": state.top_goals[:10],
                "top_obstacles": state.top_obstacles[:10],
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
        g = str(goal).strip()
        if g and g not in state.top_goals:
            state.top_goals.append(g)

    for obstacle in listener_output.get("obstacles", []):
        o = str(obstacle).strip()
        if o and o not in state.top_obstacles:
            state.top_obstacles.append(o)

    niche = listener_output.get("niche")
    if niche:
        state.niche = str(niche)

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
