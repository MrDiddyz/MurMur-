from __future__ import annotations

import pytest

from modules.avatar_clone import AvatarCloneValidationError, run_avatar_clone


def _base_payload() -> dict:
    return {
        "avatar_core": {"voice": "direct"},
        "context": {"campaign": "Q2 Launch", "offer": "MurMur Sprint"},
        "memory": {"recent": []},
        "task": "content_creator",
        "constraints": {"platform": "x", "schedule": "daily"},
        "telemetry": {"kpis": ["ctr: 3.2%"]},
    }


def test_run_avatar_clone_returns_required_schema() -> None:
    result = run_avatar_clone(_base_payload())

    assert result["task"] == "content_creator"
    assert result["version"] == "1.0"
    assert set(result["outputs"].keys()) == {"content", "dm_replies", "decisions", "ops"}
    assert result["quality"]["style_score"] >= 85
    assert result["quality"]["brand_risk"] == "low"


def test_run_avatar_clone_rejects_missing_input() -> None:
    with pytest.raises(AvatarCloneValidationError):
        run_avatar_clone({"task": "content_creator"})


def test_run_avatar_clone_rejects_unsupported_task() -> None:
    payload = _base_payload()
    payload["task"] = "other"

    with pytest.raises(AvatarCloneValidationError):
        run_avatar_clone(payload)


@pytest.mark.parametrize(
    "task_key,task_name",
    [
        ("content", "content_creator"),
        ("dm_replies", "offer_seller"),
        ("decisions", "decision_engine"),
        ("ops", "daily_operator"),
    ],
)
def test_run_avatar_clone_routes_output_to_task_bucket(task_key: str, task_name: str) -> None:
    payload = _base_payload()
    payload["task"] = task_name

    result = run_avatar_clone(payload)

    assert result["outputs"][task_key]
