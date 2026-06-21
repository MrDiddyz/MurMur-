from __future__ import annotations


class TeacherPolicyError(ValueError):
    pass


def enforce_no_claim_without_evidence(payload: dict) -> None:
    claims = payload.get("claims", [])
    evidence = payload.get("evidence", [])
    if claims and not evidence:
        raise TeacherPolicyError("no-claim-without-evidence")
