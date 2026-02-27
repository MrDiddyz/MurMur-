import os
import tempfile

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



def test_run_full_data_engineer_app_programmer_workflow():
    with tempfile.TemporaryDirectory() as d:
        db = os.path.join(d, "murmur.db")
        store = Store(db)
        orch = Orchestrator(store)
        run = orch.run(
            "Kjør full data Engineer app programmer",
            workflow="full_data_engineer_app_programmer",
        )
        assert run.status == "done"
        roles = [task.role for task in run.tasks]
        assert "data_engineer" in roles
        assert "app_programmer" in roles
        assert "data_engineer:Design dataplattform og kvalitetssjekker" in run.summary
