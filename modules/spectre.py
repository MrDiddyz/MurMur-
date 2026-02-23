from __future__ import annotations

from typing import Any

from modules.memory import RuntimeState


def run_spectre_mode(user_text: str, listener_output: dict[str, Any], state: RuntimeState) -> dict[str, Any]:
    goals = listener_output.get("goals", []) or ["Bygge en enkel inntektsmotor"]
    obstacles = listener_output.get("obstacles", []) or ["Lite tid"]

    primary_goal = goals[0]
    primary_obstacle = obstacles[0]

    spectre_phases = [
        "Scan: finn varme leads i en snever nisje",
        "Prioriter: ranger leads etter kjøpssignal",
        "Trigger: send målrettet outreach med ett klart tilbud",
        "Refiner: logg svar, lær, og juster automatisk",
        "Execute: repeter daglig med KPI-kontroll",
    ]

    next_actions = [
        f"Velg én nisje: {state.niche}",
        f"Definer ett resultatløfte for målet '{primary_goal}'",
        f"Lag en anti-friksjon-rutine for hinderet '{primary_obstacle}'",
        "Sett ukentlig måltall: leads, svarrate, avslutninger",
    ]

    return {
        "mode": "spectre",
        "summary": f"Mål: {primary_goal}. Flaskehals: {primary_obstacle}.",
        "automation_loop": spectre_phases,
        "next_actions": next_actions,
        "state_snapshot": {
            "interactions": state.interactions,
            "known_goals": state.top_goals[:5],
            "known_obstacles": state.top_obstacles[:5],
        },
        "raw_input": user_text,
    }
