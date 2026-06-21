import json
import os
import tempfile
from pathlib import Path

from murmur_core.runtime.orchestrator import Orchestrator
from murmur_core.runtime.store import Store


def test_run_happy_path():
    with tempfile.TemporaryDirectory() as d:
        db = os.path.join(d, "murmur.db")
        store = Store(db)
        orch = Orchestrator(store)
        run = orch.run("Bygg en demo for content-agent som poster ukentlig")
        assert run.status == "done"
        assert run.run_id
        assert len(run.events) > 0
        assert "research" in run.summary


def test_golden_run_snapshot_contract():
    fixtures_dir = Path(__file__).parent / "fixtures"
    snapshots_dir = Path(__file__).parent / "snapshots"
    fixture = json.loads((fixtures_dir / "golden_goal.json").read_text(encoding="utf-8"))
    expected = json.loads((snapshots_dir / "golden_run_snapshot.json").read_text(encoding="utf-8"))

    with tempfile.TemporaryDirectory() as d:
        store = Store(os.path.join(d, "golden.db"))
        run = Orchestrator(store).run(fixture["goal"])

    assert run.status == expected["status"]
    for token in expected["required_summary_tokens"]:
        assert token in run.summary
