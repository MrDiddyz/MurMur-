import json
import os
import tempfile
from pathlib import Path

from murmur_core.runtime.orchestrator import Orchestrator
from murmur_core.runtime.store import Store

GOLDEN_DIR = Path(__file__).resolve().parents[1] / "codex" / "golden"
FIXTURE_PATH = GOLDEN_DIR / "fixtures" / "content_demo.input.json"
EXPECTED_PATH = GOLDEN_DIR / "expected" / "content_demo.output.json"


def _normalize_reflection_events(events: list[dict]) -> list[dict]:
    normalized = []
    for event in events:
        normalized.append(
            {
                "role": event["role"],
                "type": event["type"],
                "message": event["message"],
                "data": event.get("data", {}),
            }
        )
    return normalized


def _normalize_run(run):
    normalized_events = []
    for event in run.events:
        normalized_events.append(
            {
                "role": event.role,
                "type": event.type,
                "message": event.message,
                "data": event.data,
            }
        )

    normalized_tasks = []
    for task in run.tasks:
        task_input = task.input
        if task.role == "reflection" and "events" in task.input:
            task_input = {
                "events": _normalize_reflection_events(task.input["events"]),
            }

        normalized_tasks.append(
            {
                "role": task.role,
                "title": task.title,
                "status": task.status,
                "input": task_input,
                "output": task.output,
                "error": task.error,
            }
        )

    return {
        "goal": run.goal,
        "status": run.status,
        "summary": run.summary,
        "events": normalized_events,
        "tasks": normalized_tasks,
    }


def test_golden_run_matches_snapshot():
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))

    with tempfile.TemporaryDirectory() as tmp_dir:
        store = Store(os.path.join(tmp_dir, "murmur.db"))
        run = Orchestrator(store).run(fixture["goal"])

    actual = _normalize_run(run)
    expected = json.loads(EXPECTED_PATH.read_text(encoding="utf-8"))

    assert actual == expected
