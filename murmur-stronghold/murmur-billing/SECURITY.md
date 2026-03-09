# Webhook Threat Model and Mitigations

## Threats
1. **Webhook spoofing**: an attacker sends forged webhook payloads to trigger unauthorized state transitions.
2. **Replay attack**: a valid webhook is captured and resent to repeat side effects.
3. **Stale request reuse**: old signed payloads are replayed long after issuance.
4. **Credential stuffing / abuse**: repeated high-volume requests degrade availability.
5. **Secret leakage via logs**: headers or shared secrets accidentally emitted in logs.

## Mitigations
- **HMAC verification with timing-safe comparison** protects against spoofing by requiring valid signatures built from a server-side secret.
- **Nonce + timestamp replay cache** rejects duplicate `timestamp:nonce` pairs within the validity window.
- **Maximum timestamp age (5 minutes)** rejects expired requests and limits replay window.
- **Header auth token (`x-webhook-auth`)** adds explicit endpoint authentication beyond signature checks.
- **Per-IP rate limiting** throttles abusive request bursts with `429` responses.
- **Sanitized logging** logs only rejection reason and event metadata; it never logs secrets, auth headers, or signature material.

## Threat-to-mitigation mapping
- T1 → HMAC verification, auth token.
- T2 → Nonce/timestamp replay cache.
- T3 → Timestamp max-age enforcement.
- T4 → Per-IP request rate limit.
- T5 → Sanitized logging policy and implementation.
