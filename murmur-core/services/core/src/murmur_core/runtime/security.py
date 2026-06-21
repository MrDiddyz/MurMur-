from __future__ import annotations

import hashlib
import hmac
import os
import time


class SecurityError(ValueError):
    pass


def _secret() -> bytes:
    return os.getenv("MURMUR_SIGNING_SECRET", "dev-secret").encode("utf-8")


def sign_message(message: str, nonce: str, ts: int | None = None) -> str:
    ts = ts or int(time.time())
    body = f"{ts}:{nonce}:{message}".encode("utf-8")
    return hmac.new(_secret(), body, hashlib.sha256).hexdigest()


def verify_message(message: str, nonce: str, ts: int, signature: str, max_age_s: int = 120) -> None:
    now = int(time.time())
    if abs(now - ts) > max_age_s:
        raise SecurityError("message-expired")
    expected = sign_message(message=message, nonce=nonce, ts=ts)
    if not hmac.compare_digest(expected, signature):
        raise SecurityError("invalid-signature")
