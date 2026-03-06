#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
TIMEOUT="${2:-60}"

if [ -z "$URL" ]; then
  echo "Usage: wait-for-http.sh <url> [timeout_seconds]"
  exit 1
fi

for i in $(seq 1 "$TIMEOUT"); do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    echo "Ready: $URL"
    exit 0
  fi
  sleep 1
done

echo "Timeout waiting for $URL"
exit 1
