#!/usr/bin/env bash
set -euo pipefail

check_url() {
  local name="$1"
  local url="$2"

  if curl -fsS "$url" >/dev/null 2>&1; then
    printf "%-20s OK\n" "$name"
  else
    printf "%-20s FAIL (%s)\n" "$name" "$url"
    return 1
  fi
}

echo "Checking MurMur local stack..."
echo

FAIL=0

check_url "web" "http://localhost:3000/health" || FAIL=1
check_url "api" "http://localhost:3001/health" || FAIL=1
check_url "worker" "http://localhost:3010/health" || FAIL=1
check_url "planner-agent" "http://localhost:3101/health" || FAIL=1
check_url "builder-agent" "http://localhost:3102/health" || FAIL=1
check_url "reviewer-agent" "http://localhost:3103/health" || FAIL=1
check_url "optimizer-agent" "http://localhost:3104/health" || FAIL=1

echo

if [ "$FAIL" -eq 0 ]; then
  echo "All MurMur services reachable."
  exit 0
else
  echo "One or more services are unreachable."
  exit 1
fi
