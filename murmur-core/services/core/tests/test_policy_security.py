import os
import tempfile
import time

import pytest

from murmur_core.runtime.policies import TeacherPolicyError, enforce_no_claim_without_evidence
from murmur_core.runtime.security import SecurityError, sign_message, verify_message
from murmur_core.runtime.store import Store


def test_teacher_policy_no_claim_without_evidence():
    with pytest.raises(TeacherPolicyError):
        enforce_no_claim_without_evidence({"claims": ["x"], "evidence": []})


def test_hmac_sign_and_verify_and_replay_marking():
    now = int(time.time())
    sig = sign_message("hello", "n-1", ts=now)
    verify_message("hello", "n-1", ts=now, signature=sig)
    with pytest.raises(SecurityError):
        verify_message("tampered", "n-1", ts=now, signature=sig)

    with tempfile.TemporaryDirectory() as d:
        store = Store(os.path.join(d, "nonce.db"))
        assert store.mark_nonce_used("n-1", now) is True
        assert store.mark_nonce_used("n-1", now) is False
