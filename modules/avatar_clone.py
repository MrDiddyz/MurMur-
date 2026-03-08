from __future__ import annotations

from typing import Any

ALLOWED_TASKS = {"content_creator", "offer_seller", "decision_engine", "daily_operator"}


class AvatarCloneValidationError(ValueError):
    """Raised when required input keys are missing or invalid."""


def run_avatar_clone(payload: dict[str, Any]) -> dict[str, Any]:
    _validate_payload(payload)

    task = payload["task"]
    assumptions = _build_assumptions(payload)

    outputs = {
        "content": [],
        "dm_replies": [],
        "decisions": [],
        "ops": [],
    }

    if task == "content_creator":
        outputs["content"] = _content_items(payload)
    elif task == "offer_seller":
        outputs["dm_replies"] = _offer_reply_tree(payload)
    elif task == "decision_engine":
        outputs["decisions"] = _decision_items(payload)
    elif task == "daily_operator":
        outputs["ops"] = _ops_items(payload)

    result = {
        "task": task,
        "version": "1.0",
        "assumptions": assumptions,
        "outputs": outputs,
        "events": [
            {
                "type": "avatar_clone.response_created",
                "task": task,
            }
        ],
        "quality": {
            "style_score": 90,
            "brand_risk": "low",
            "notes": ["Output constrained to AvatarCore and schema."],
        },
    }

    return result


def _validate_payload(payload: dict[str, Any]) -> None:
    required_keys = [
        "avatar_core",
        "context",
        "memory",
        "task",
        "constraints",
        "telemetry",
    ]

    missing = [key for key in required_keys if key not in payload]
    if missing:
        raise AvatarCloneValidationError(f"Missing required keys: {', '.join(missing)}")

    task = payload.get("task")
    if task not in ALLOWED_TASKS:
        allowed = ", ".join(sorted(ALLOWED_TASKS))
        raise AvatarCloneValidationError(f"Unsupported task '{task}'. Expected one of: {allowed}")


def _build_assumptions(payload: dict[str, Any]) -> list[str]:
    context = payload.get("context", {})
    if isinstance(context, dict) and context.get("campaign"):
        return [f"Assumption: campaign focus is '{context['campaign']}'."]
    return ["Assumption: insufficient context details were provided; using conservative defaults."]


def _content_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "post": "Problem → method → proof → CTA.",
            "cta_variations": ["Reply 'PLAN' for details.", "DM 'START' to get the next step."],
            "platform": payload.get("constraints", {}).get("platform", "unknown"),
        }
    ]


def _offer_reply_tree(payload: dict[str, Any]) -> list[dict[str, str]]:
    offer_name = payload.get("context", {}).get("offer", "the offer")
    return [
        {
            "short": f"Yes—{offer_name} fits if you want a fast execution plan.",
            "medium": f"Great question. {offer_name} is built for focused execution with clear milestones.",
            "long": f"Here is the full view: {offer_name} includes strategy, execution checkpoints, and KPI tracking.",
            "next_step_question": "What is your #1 blocker right now?",
        }
    ]


def _decision_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    kpis = payload.get("telemetry", {}).get("kpis", [])
    return [
        {
            "priority": "Double down on the best-performing channel from recent KPIs.",
            "rationale": f"KPI signals reviewed: {kpis if kpis else 'none provided'}.",
            "not_to_do": ["Do not launch new channels until current winner stabilizes."],
        }
    ]


def _ops_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    schedule = payload.get("constraints", {}).get("schedule", "not specified")
    return [
        {
            "daily_plan": ["Review telemetry", "Publish queued item", "Respond to inbound DMs", "Log learnings"],
            "queue_items": ["1 educational post", "1 proof post", "3 follow-up DMs"],
            "analysis": "Track completion rate and CTA response rate.",
            "next_experiments": ["Test CTA wording A/B", "Test post format: list vs story"],
            "schedule": schedule,
        }
    ]
