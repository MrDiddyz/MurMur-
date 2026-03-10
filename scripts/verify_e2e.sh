#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-murmur-stronghold/docker-compose.yml}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/health}"
E2E_TIMEOUT_SECONDS="${E2E_TIMEOUT_SECONDS:-120}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-3}"
VERIFY_E2E_MODE="${VERIFY_E2E_MODE:-auto}"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-murmur}"
PGDATABASE="${PGDATABASE:-murmur}"
PGPASSWORD="${PGPASSWORD:-murmur}"
REDIS_HOST_DIRECT="${REDIS_HOST_DIRECT:-localhost}"
REDIS_PORT_DIRECT="${REDIS_PORT_DIRECT:-6379}"

export DATABASE_URL="${DATABASE_URL:-postgresql://murmur:murmur@postgres:5432/murmur}"
export JWT_SECRET="${JWT_SECRET:-dev-jwt-secret}"
export STRIPE_KEY="${STRIPE_KEY:-sk_test_placeholder}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-whsec_placeholder}"
export REDIS_HOST="${REDIS_HOST:-redis}"
export CORE_URL="${CORE_URL:-http://core:8000}"
export TIKTOK_WEBHOOK_SECRET="${TIKTOK_WEBHOOK_SECRET:-dev-tiktok-webhook-secret}"

log() { printf '[verify:e2e] %s\n' "$*"; }
fail() { printf '[verify:e2e] FAIL: %s\n' "$*" >&2; exit 1; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

docker_compose_available() {
  if command_exists docker && docker compose version >/dev/null 2>&1; then
    return 0
  fi

  command_exists docker-compose
}

COMPOSE_CMD=()
if command_exists docker && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command_exists docker-compose; then
  COMPOSE_CMD=(docker-compose)
fi

compose_run() {
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" "$@"
}

mode="$VERIFY_E2E_MODE"
if [[ "$mode" == "auto" ]]; then
  if docker_compose_available && [[ -f "$COMPOSE_FILE" ]]; then
    mode="docker"
  else
    mode="direct"
  fi
fi

case "$mode" in
  docker)
    docker_compose_available || fail "docker compose (plugin or docker-compose) is required in VERIFY_E2E_MODE=docker"
    [[ -f "$COMPOSE_FILE" ]] || fail "compose file not found: $COMPOSE_FILE"
    ;;
  direct)
    command_exists psql || fail "psql is required in VERIFY_E2E_MODE=direct"
    command_exists redis-cli || fail "redis-cli is required in VERIFY_E2E_MODE=direct"
    ;;
  *)
    fail "Unsupported VERIFY_E2E_MODE=$mode (expected auto|docker|direct)"
    ;;
esac

sql_query() {
  local query="$1"

  if [[ "$mode" == "docker" ]]; then
    compose_run exec -T postgres \
      psql -U murmur -d murmur -t -A -v ON_ERROR_STOP=1 -c "$query"
  else
    PGPASSWORD="$PGPASSWORD" psql \
      -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
      -t -A -v ON_ERROR_STOP=1 -c "$query"
  fi
}

sql_exec() {
  local query="$1"

  if [[ "$mode" == "docker" ]]; then
    compose_run exec -T postgres \
      psql -U murmur -d murmur -v ON_ERROR_STOP=1 -c "$query" >/dev/null
  else
    PGPASSWORD="$PGPASSWORD" psql \
      -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
      -v ON_ERROR_STOP=1 -c "$query" >/dev/null
  fi
}

redis_lpush() {
  local queue="$1"
  local value="$2"

  if [[ "$mode" == "docker" ]]; then
    compose_run exec -T redis redis-cli LPUSH "$queue" "$value" >/dev/null
  else
    redis-cli -h "$REDIS_HOST_DIRECT" -p "$REDIS_PORT_DIRECT" LPUSH "$queue" "$value" >/dev/null
  fi
}

if [[ "$mode" == "docker" ]]; then
  log "Starting required services via docker compose"
  compose_run up -d postgres redis core billing worker >/dev/null
else
  log "VERIFY_E2E_MODE=direct: assuming Postgres/Redis/services are already running"
fi

log "Waiting for billing health endpoint: $HEALTH_URL"
deadline=$(( $(date +%s) + E2E_TIMEOUT_SECONDS ))
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  if (( $(date +%s) >= deadline )); then
    if [[ "$mode" == "docker" ]]; then
      compose_run ps || true
    fi
    fail "Billing health check timed out after ${E2E_TIMEOUT_SECONDS}s"
  fi
  sleep 2
done

log "Creating synthetic payment intent + job in Postgres"
intent_goal="verification-e2e-$(date +%s)"
intent_id="$(sql_query "INSERT INTO payment_intents(email, goal, status) VALUES ('verify@example.com', '${intent_goal}', 'queued') RETURNING id;" | tr -d '[:space:]')"

[[ -n "$intent_id" ]] || fail "Failed to create payment_intents row"

sql_exec "INSERT INTO jobs(intent_id, status, retries) VALUES (${intent_id}, 'queued', 0) ON CONFLICT (intent_id) DO UPDATE SET status='queued';"

log "Enqueueing intent ${intent_id} on Redis"
redis_lpush "agent_queue" "$intent_id"

log "Polling job + intent state"
terminal=""
reason=""
while (( $(date +%s) < deadline )); do
  state_line="$(sql_query "SELECT COALESCE(j.status,''), COALESCE(pi.status,'') FROM jobs j JOIN payment_intents pi ON pi.id=j.intent_id WHERE j.intent_id=${intent_id} LIMIT 1;" | tr -d '[:space:]')"

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
  if [[ "$mode" == "docker" ]]; then
    compose_run logs --no-color --tail=80 billing worker core || true
  fi
  fail "$reason (intent_id=${intent_id})"
fi

run_count="$(sql_query "SELECT COUNT(*) FROM agent_runs WHERE goal='${intent_goal}';" | tr -d '[:space:]')"

if [[ "${run_count:-0}" -lt 1 ]]; then
  fail "Worker did not create agent_runs entry for goal=${intent_goal}"
fi

log "PASS: E2E queue pipeline completed for intent_id=${intent_id}"
