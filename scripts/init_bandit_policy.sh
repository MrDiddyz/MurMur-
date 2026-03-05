#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Initialize bandit policy in Supabase Edge Functions.

Usage:
  scripts/init_bandit_policy.sh --project <ref> [--agent-id <id>] [--arms <csv>] [--token <jwt>] [--dry-run]

Options:
  --project    Supabase project ref (e.g. abcdefghijklmno)
  --agent-id   Agent id to initialize (default: PAPI)
  --arms       Comma-separated list of bandit arms (default: swing_05,swing_08,swing_11)
  --token      Optional bearer token for protected functions. If omitted, request is sent without Authorization header.
  --dry-run    Print request details without sending.
  -h, --help   Show this help message.

Environment fallbacks:
  SUPABASE_PROJECT_REF
  SUPABASE_SERVICE_ROLE_KEY (used as --token when not explicitly provided)
USAGE
}

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
AGENT_ID="PAPI"
ARMS_CSV="swing_05,swing_08,swing_11"
TOKEN="${SUPABASE_SERVICE_ROLE_KEY:-}"
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_REF="$2"
      shift 2
      ;;
    --agent-id)
      AGENT_ID="$2"
      shift 2
      ;;
    --arms)
      ARMS_CSV="$2"
      shift 2
      ;;
    --token)
      TOKEN="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_REF" ]]; then
  echo "Error: missing --project (or SUPABASE_PROJECT_REF)." >&2
  exit 1
fi

IFS=',' read -r -a ARMS <<< "$ARMS_CSV"
if [[ ${#ARMS[@]} -eq 0 ]]; then
  echo "Error: --arms cannot be empty." >&2
  exit 1
fi

for i in "${!ARMS[@]}"; do
  ARMS[$i]="$(echo "${ARMS[$i]}" | xargs)"
done

ARMS_JSON=""
for arm in "${ARMS[@]}"; do
  [[ -z "$arm" ]] && continue
  if [[ -n "$ARMS_JSON" ]]; then
    ARMS_JSON+=","
  fi
  ARMS_JSON+="\"${arm}\""
done

if [[ -z "$ARMS_JSON" ]]; then
  echo "Error: all arms resolved to empty values." >&2
  exit 1
fi

URL="https://${PROJECT_REF}.functions.supabase.co/bandit-policy/init"
PAYLOAD="{\"agentId\":\"${AGENT_ID}\",\"arms\":[${ARMS_JSON}]}"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "DRY RUN"
  echo "POST $URL"
  echo "payload: $PAYLOAD"
  if [[ -n "$TOKEN" ]]; then
    echo "authorization: bearer <redacted>"
  else
    echo "authorization: (none)"
  fi
  exit 0
fi

CURL_ARGS=(
  -sS
  -X POST "$URL"
  -H "content-type: application/json"
  -d "$PAYLOAD"
)

if [[ -n "$TOKEN" ]]; then
  CURL_ARGS+=( -H "authorization: Bearer ${TOKEN}" )
fi

echo "Initializing bandit policy for agent '${AGENT_ID}' on project '${PROJECT_REF}'..."
curl "${CURL_ARGS[@]}"
echo
