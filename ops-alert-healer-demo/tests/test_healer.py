import json

import healer


def _fields(target: str, action: str = "restart"):
    return {"summary": json.dumps({"target_service": target, "action": action})}


def test_decision_allowlisted_and_not_rate_limited(monkeypatch):
    monkeypatch.setattr(healer, "ALLOWLIST", {"dummy-service"})
    monkeypatch.setattr(healer, "MIN_RESTART_INTERVAL_SECONDS", 60)

    decision = healer.parse_decision(_fields("dummy-service"), now=1000, last_restart_at={})
    assert decision.should_restart


def test_decision_rejects_non_allowlisted(monkeypatch):
    monkeypatch.setattr(healer, "ALLOWLIST", {"approved"})

    decision = healer.parse_decision(_fields("dummy-service"), now=1000, last_restart_at={})
    assert not decision.should_restart
    assert decision.reason == "target not allowlisted"


def test_decision_rate_limited(monkeypatch):
    monkeypatch.setattr(healer, "ALLOWLIST", {"dummy-service"})
    monkeypatch.setattr(healer, "MIN_RESTART_INTERVAL_SECONDS", 60)

    decision = healer.parse_decision(_fields("dummy-service"), now=1000, last_restart_at={"dummy-service": 950})
    assert not decision.should_restart
    assert decision.reason == "rate limited"


def test_decision_rejects_unsupported_action(monkeypatch):
    monkeypatch.setattr(healer, "ALLOWLIST", {"dummy-service"})

    decision = healer.parse_decision(_fields("dummy-service", action="scale"), now=1000, last_restart_at={})
    assert not decision.should_restart
    assert decision.reason == "unsupported action=scale"


def test_decision_rejects_invalid_summary_json(monkeypatch):
    monkeypatch.setattr(healer, "ALLOWLIST", {"dummy-service"})

    decision = healer.parse_decision({"summary": "{"}, now=1000, last_restart_at={})
    assert not decision.should_restart
    assert decision.reason == "missing target_service label"
