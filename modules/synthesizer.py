from __future__ import annotations


def run_synthesizer(planner_output: dict[str, object], tone: str) -> str:
    style_prefix = {
        "neutral": "Her er en strukturert plan:",
        "friendly": "Kult, her er en enkel og praktisk plan:",
        "direct": "Kortversjon:",
        "knivskarp": "Knivskarp plan:",
    }.get(tone, "Her er en plan:")

    mode = planner_output.get("mode", "standard")
    loop = planner_output.get("automation_loop", [])
    actions = planner_output.get("next_actions", [])
    summary = planner_output.get("summary", "")

    loop_text = "\n".join(f"- {step}" for step in loop)
    actions_text = "\n".join(f"- {step}" for step in actions)

    return (
        f"{style_prefix}\n\n"
        f"Modus: {mode}. {summary}\n\n"
        "Automatiseringssløyfe:\n"
        f"{loop_text}\n\n"
        "Neste steg:\n"
        f"{actions_text}\n\n"
        "Systemet logger alt og oppdaterer minne i sanntid."
    )
