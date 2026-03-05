import json

from adapter import _signature_for_payload, _validate_signature


def test_signature_roundtrip():
    payload = b'{"ok": true}'
    secret = "top-secret"
    signature = _signature_for_payload(payload, secret)
    assert _validate_signature(payload, signature, secret)


def test_signature_rejects_tamper():
    payload = b'{"ok": true}'
    secret = "top-secret"
    signature = _signature_for_payload(payload, secret)
    assert not _validate_signature(payload + b"x", signature, secret)


def test_signature_optional_when_secret_missing():
    assert _validate_signature(b"{}", None, "")
