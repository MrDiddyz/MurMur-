from __future__ import annotations


def _format_list(items: list[str], *, limit: int | None = None, indent: str = "- ") -> str:
    source = items[:limit] if limit is not None else items
    return "\n".join(f"{indent}{item}" for item in source)


def run_synthesizer(planner_output: dict[str, object], tone: str) -> str:
    style_prefix = {
        "neutral": "Her er en strukturert plan:",
        "friendly": "Kult, her er en enkel og praktisk plan:",
        "direct": "Kortversjon:",
        "knivskarp": "Knivskarp plan:",
    }.get(tone, "Her er en plan:")

    mode = planner_output.get("mode", "standard")
    loop = [str(step) for step in planner_output.get("automation_loop", [])]
    actions = [str(step) for step in planner_output.get("next_actions", [])]
    summary = str(planner_output.get("summary", ""))

    concise = tone == "knivskarp"
    loop_text = _format_list(loop, limit=4 if concise else None)
    actions_text = _format_list(actions, limit=6 if concise else None)

    sections: list[str] = [
        f"{style_prefix}\n\nModus: {mode}. {summary}",
        f"Automatiseringssløyfe:\n{loop_text}",
        f"Neste steg:\n{actions_text}",
    ]

    video_system_template = planner_output.get("video_system_template")
    if isinstance(video_system_template, dict):
        architecture = _format_list(
            [str(item) for item in video_system_template.get("modular_architecture", [])],
            limit=3 if concise else None,
            indent="  - ",
        )
        policy = _format_list(
            [str(item) for item in video_system_template.get("optimization_policy", [])],
            limit=2 if concise else None,
            indent="  - ",
        )
        sections.append(
            "Template for modulært modell-system (realtime):\n"
            f"Navn: {video_system_template.get('name', '')}\n"
            f"Fokus: {video_system_template.get('focus', '')}\n"
            "Arkitektur:\n"
            f"{architecture}\n"
            "Optimalisering:\n"
            f"{policy}"
        )

    senior_template = planner_output.get("senior_template")
    if isinstance(senior_template, dict):
        weekly_training = _format_list(
            [str(item) for item in senior_template.get("weekly_training", [])],
            limit=3 if concise else None,
            indent="  - ",
        )
        nutrition_framework = _format_list(
            [str(item) for item in senior_template.get("nutrition_framework", [])],
            limit=3 if concise else None,
            indent="  - ",
        )
        sections.append(
            "Skreddersydd template (eldre treningspartner + motivator):\n"
            f"Navn: {senior_template.get('name', '')}\n"
            f"Målgruppe: {senior_template.get('target_group', '')}\n"
            "Ukesplan trening:\n"
            f"{weekly_training}\n"
            "Sunt kosthold / vekt / helse:\n"
            f"{nutrition_framework}"
        )

    sections.append("Systemet logger alt, scorer videokvalitet og oppdaterer minne i sanntid.")
    return "\n\n".join(sections)
