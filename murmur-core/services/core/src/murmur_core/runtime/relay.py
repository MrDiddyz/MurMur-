from __future__ import annotations


def ws_to_osc_message(payload: dict) -> str:
    channel = payload.get("channel", "show")
    cue = payload.get("cue", "hello")
    return f"/{channel}/cue {cue}"
