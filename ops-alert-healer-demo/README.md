# Alert Adapter + Healer Agent (Local Demo)

Minimal demo with two services:

1. **Adapter**: receives Alertmanager webhook, optionally validates signature, publishes each alert into Redis Streams.
2. **Healer Agent**: consumes stream entries and safely restarts only allowlisted targets, with rate limiting.

## Architecture

- `POST /webhook/alertmanager` -> `adapter.py`
- Adapter publishes stream events to Redis stream `alerts`.
- `healer.py` reads stream via consumer group `healers` and processes restart requests.
- Dummy target container: `dummy-service`.

## Signature Validation (optional v1)

When `ALERTMANAGER_SIGNING_SECRET` is set, the adapter expects header:

- `X-Alertmanager-Signature: sha256=<hmac_hex>`

The HMAC is computed over the raw request body using SHA-256.
If the secret is not set, signature validation is skipped.

## Run local demo

```bash
docker compose -f ops-alert-healer-demo/docker-compose.yml up --build -d
```

## Send a sample alert

```bash
body='{"status":"firing","receiver":"demo","alerts":[{"labels":{"alertname":"ServiceDown","severity":"critical","target_service":"dummy-service","action":"restart"},"annotations":{"summary":"dummy service down"}}]}'
sig=$(BODY="$body" python - <<'PY'
import hashlib, hmac, os
body = os.environ["BODY"].encode()
secret = b"demo-secret"
print("sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest())
PY
)
curl -i -X POST http://localhost:8080/webhook/alertmanager \
  -H "Content-Type: application/json" \
  -H "X-Alertmanager-Signature: $sig" \
  --data "$body"
```

## Inspect logs

```bash
docker compose -f ops-alert-healer-demo/docker-compose.yml logs -f healer adapter
```

You should see healer messages indicating restart success or skip reasons.

## Safety controls

- Allowlist enforced via `ALLOWLIST_TARGETS`.
- Rate limit enforced per target via `MIN_RESTART_INTERVAL_SECONDS`.
- Unsupported actions are ignored.
