# Runbook + Deploy Guide

## Production checklist
- [ ] Set `MURMUR_DB_PATH` to persistent volume.
- [ ] Set `MURMUR_SIGNING_SECRET` to a strong secret.
- [ ] Set `MURMUR_SNAPSHOT_DIR` to persistent storage.
- [ ] Enable HTTPS + header forwarding for HMAC headers.
- [ ] Run `make quality` in CI before deploy.
- [ ] Health-check `/health` after rollout.

## Incident quick actions
- Replay attack suspected: rotate `MURMUR_SIGNING_SECRET`, clear `used_nonces`.
- Latency regression: inspect `/runs/{run_id}/critical-path` for top spans.
- Snapshot mismatch: verify manifest signature and snapshot storage integrity.
