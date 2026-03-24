#!/usr/bin/env bash
set -euo pipefail

printf '\n[Codex PR loop] 1/4 - Migration sanity check\n'
if compgen -G "supabase/*.sql" > /dev/null; then
  echo "Found SQL migrations/schema files in supabase/:"
  ls -1 supabase/*.sql
else
  echo "No SQL files found under supabase/."
fi

printf '\n[Codex PR loop] 2/4 - Script checks\n'
node --test scripts/codex-task-spec.test.mjs

printf '\n[Codex PR loop] 3/4 - Standard validation loop\n'
pnpm run lint
pnpm run typecheck
if ! pnpm run simulate:agents; then
  echo "[WARN] simulate:agents reported findings (non-blocking advisory)."
fi

printf '\n[Codex PR loop] 4/4 - Git status summary\n'
git status --short

printf "\nCodex safe PR loop completed successfully.\n"
