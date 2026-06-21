import tempfile

import pytest

from murmur_core.runtime.contracts import ContractValidationError, validate_contract
from murmur_core.runtime.snapshots import SnapshotEngine


def test_contract_validation_templates():
    validate_contract(
        "research",
        {"insights": ["a"], "questions": ["b"], "claims": ["c"], "evidence": ["proof"]},
    )
    with pytest.raises(ContractValidationError):
        validate_contract("builder", {"files": []})


def test_snapshot_engine_signed_manifest():
    with tempfile.TemporaryDirectory() as d:
        engine = SnapshotEngine(d)
        manifest = engine.save("run-1", {"status": "done"})
        assert manifest["run_id"] == "run-1"
        restored = engine.recall("run-1")
        assert restored["status"] == "done"
