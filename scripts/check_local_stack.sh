#!/usr/bin/env bash
set -euo pipefail

# Adaptable local endpoint checker.
#
# Priority order:
# 1) --endpoint "Label|URL" (repeatable)
# 2) STACK_ENDPOINTS env var, semicolon-separated "Label|URL;Label|URL"
# 3) Built-in defaults

DEFAULT_ENDPOINTS=(
  "Web app|http://localhost:3000"
  "Admin panel|http://localhost:4000"
  "API|http://localhost:5000"
  "Kibana|http://localhost:5601"
  "Prometheus|http://localhost:9090"
)

TIMEOUT_SECONDS="${CHECK_TIMEOUT_SECONDS:-2}"
ENDPOINTS=()

usage() {
  cat <<'USAGE'
Usage: ./scripts/check_local_stack.sh [options]

Options:
  -e, --endpoint "Label|URL"  Add endpoint to check (repeatable)
  -t, --timeout SECONDS        Curl timeout in seconds (default: 2 or CHECK_TIMEOUT_SECONDS)
  -h, --help                   Show this help message

Environment:
  STACK_ENDPOINTS              Semicolon-separated list of Label|URL values
                               Example:
                               STACK_ENDPOINTS="Web|http://localhost:3000;API|http://localhost:5000"
  CHECK_TIMEOUT_SECONDS        Timeout override (seconds)
USAGE
}

add_endpoint() {
  local value="$1"
  if [[ "$value" != *"|"* ]]; then
    echo "Invalid endpoint format: '$value' (expected Label|URL)" >&2
    exit 2
  fi
  ENDPOINTS+=("$value")
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--endpoint)
      [[ $# -ge 2 ]] || { echo "Missing value for $1" >&2; exit 2; }
      add_endpoint "$2"
      shift 2
      ;;
    -t|--timeout)
      [[ $# -ge 2 ]] || { echo "Missing value for $1" >&2; exit 2; }
      TIMEOUT_SECONDS="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ${#ENDPOINTS[@]} -eq 0 && -n "${STACK_ENDPOINTS:-}" ]]; then
  IFS=';' read -r -a from_env <<<"$STACK_ENDPOINTS"
  for item in "${from_env[@]}"; do
    [[ -n "$item" ]] && add_endpoint "$item"
  done
fi

if [[ ${#ENDPOINTS[@]} -eq 0 ]]; then
  ENDPOINTS=("${DEFAULT_ENDPOINTS[@]}")
fi

printf 'Checking local stack endpoints (timeout=%ss)...\n\n' "$TIMEOUT_SECONDS"
all_ok=true

for entry in "${ENDPOINTS[@]}"; do
  label="${entry%%|*}"
  url="${entry#*|}"

  if curl -fsS --max-time "$TIMEOUT_SECONDS" "$url" >/dev/null; then
    printf '✅ %-14s %s is reachable\n' "${label}:" "$url"
  else
    printf '❌ %-14s %s is not reachable\n' "${label}:" "$url"
    all_ok=false
  fi
done

printf '\n'
if [[ "$all_ok" == true ]]; then
  printf 'All configured endpoints are up.\n'
else
  printf 'One or more configured endpoints are down.\n'
  printf 'If Docker is installed, try: docker compose up -d --build\n'
  exit 1
fi
