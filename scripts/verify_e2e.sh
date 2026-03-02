#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-murmur-stronghold/docker-compose.yml}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/health}"
E2E_TIMEOUT_SECONDS="${E2E_TIMEOUT_SECONDS:-120}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-3}"

export DATABASE_URL="${DATABASE_URL:-postgresql://murmur:murmur@postgres:5432/murmur}"
export JWT_SECRET="${JWT_SECRET:-dev-jwt-secret}"
export STRIPE_KEY="${STRIPE_KEY:-sk_test_placeholder}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-whsec_placeholder}"
export REDIS_HOST="${REDIS_HOST:-redis}"
export CORE_URL="${CORE_URL:-http://core:8000}"
export TIKTOK_WEBHOOK_SECRET="${TIKTOK_WEBHOOK_SECRET:-dev-tiktok-webhook-secret}"

log() { printf '[verify:e2e] %s\n' "$*"; }
fail() { printf '[verify:e2e] FAIL: %s\n' "$*" >&2; exit 1; }

log "Starting required services via docker compose"
docker compose -f "$COMPOSE_FILE" up -d postgres redis core billing worker >/dev/null

log "Waiting for billing health endpoint: $HEALTH_URL"
deadline=$(( $(date +%s) + E2E_TIMEOUT_SECONDS ))
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  if (( $(date +%s) >= deadline )); then
    docker compose -f "$COMPOSE_FILE" ps || true
    fail "Billing health check timed out after ${E2E_TIMEOUT_SECONDS}s"
  fi
  sleep 2
done

log "Creating synthetic payment intent + job in Postgres"
intent_goal="verification-e2e-$(date +%s)"
intent_id="$({
  docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U murmur -d murmur -t -A -v ON_ERROR_STOP=1 \
    -c "INSERT INTO payment_intents(email, goal, status) VALUES ('verify@example.com', '${intent_goal}', 'queued') RETURNING id;"
} | tr -d '[:space:]')"

[[ -n "$intent_id" ]] || fail "Failed to create payment_intents row"

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -U murmur -d murmur -v ON_ERROR_STOP=1 \
  -c "INSERT INTO jobs(intent_id, status, retries) VALUES (${intent_id}, 'queued', 0) ON CONFLICT (intent_id) DO UPDATE SET status='queued';" >/dev/null

log "Enqueueing intent ${intent_id} on Redis"
docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli LPUSH agent_queue "$intent_id" >/dev/null

log "Polling job + intent state"
terminal=""
reason=""
while (( $(date +%s) < deadline )); do
  state_line="$({
    docker compose -f "$COMPOSE_FILE" exec -T postgres \
      psql -U murmur -d murmur -t -A -F '|' -v ON_ERROR_STOP=1 \
      -c "SELECT COALESCE(j.status,''), COALESCE(pi.status,'') FROM jobs j JOIN payment_intents pi ON pi.id=j.intent_id WHERE j.intent_id=${intent_id} LIMIT 1;"
  } | tr -d '[:space:]')"

  job_status="${state_line%%|*}"
  intent_status="${state_line##*|}"

  if [[ "$job_status" == "completed" && "$intent_status" == "completed" ]]; then
    terminal="pass"
    break
  fi

  if [[ "$job_status" == "failed" || "$intent_status" == "failed" ]]; then
    terminal="fail"
    reason="job_status=${job_status}, intent_status=${intent_status}"
    break
  fi

  sleep "$POLL_INTERVAL_SECONDS"
done

if [[ "$terminal" != "pass" ]]; then
  if [[ -z "$reason" ]]; then
    reason="timed out waiting for completion"
  fi
  docker compose -f "$COMPOSE_FILE" logs --no-color --tail=80 billing worker core || true
  fail "$reason (intent_id=${intent_id})"
fi

run_count="$({
  docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U murmur -d murmur -t -A -v ON_ERROR_STOP=1 \
    -c "SELECT COUNT(*) FROM agent_runs WHERE goal='${intent_goal}';"
} | tr -d '[:space:]')"

if [[ "${run_count:-0}" -lt 1 ]]; then
  fail "Worker did not create agent_runs entry for goal=${intent_goal}"
fi

log "PASS: E2E queue pipeline completed for intent_id=${intent_id}"
