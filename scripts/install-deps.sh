#!/usr/bin/env bash
set -euo pipefail

# Reliable installer for packages that may fail due to transient registry/network policies.
# Usage:
#   scripts/install-deps.sh [package ...]
#
# Environment overrides:
#   INSTALL_RETRIES=4
#   INSTALL_BACKOFF_SECONDS=2
#   FALLBACK_REGISTRIES="https://registry.npmjs.org https://registry.npmmirror.com"

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <package...>"
  exit 2
fi

retries="${INSTALL_RETRIES:-4}"
backoff_base="${INSTALL_BACKOFF_SECONDS:-2}"

# Keep current npm registry first, then optional fallbacks.
current_registry="$(npm config get registry 2>/dev/null || true)"
current_registry="${current_registry:-https://registry.npmjs.org}"
current_registry="${current_registry%/}"

fallback_registries="${FALLBACK_REGISTRIES:-https://registry.npmjs.org}"

# Build ordered unique registry list.
declare -a registries
registries+=("${current_registry}")
for reg in ${fallback_registries}; do
  reg="${reg%/}"
  skip=false
  for existing in "${registries[@]}"; do
    if [[ "$existing" == "$reg" ]]; then
      skip=true
      break
    fi
  done
  if [[ "$skip" == false ]]; then
    registries+=("$reg")
  fi
done

packages=("$@")

echo "Installing: ${packages[*]}"
echo "Retries per registry: ${retries}"
echo "Registry order: ${registries[*]}"

attempt_install() {
  local registry="$1"
  local attempt="$2"

  printf "\n[Attempt %s/%s] npm install via %s\n" "$attempt" "$retries" "$registry"
  # --no-audit/--no-fund reduces nonessential network calls in restricted environments.
  npm install --registry "${registry}" --no-audit --no-fund "${packages[@]}"
}

for reg in "${registries[@]}"; do
  attempt=1
  while [[ "$attempt" -le "$retries" ]]; do
    if attempt_install "$reg" "$attempt"; then
      printf "\nInstall succeeded via %s.\n" "$reg"
      exit 0
    fi

    sleep_seconds=$(( backoff_base * attempt ))
    echo "Install failed on ${reg} (attempt ${attempt}). Backing off ${sleep_seconds}s..."
    sleep "$sleep_seconds"
    attempt=$((attempt + 1))
  done

  echo "All attempts failed for registry: ${reg}"
done

printf "\nERROR: Unable to install packages after trying all registries and retries.\n"
echo "Tip: set FALLBACK_REGISTRIES to your internal npm mirror, for example:"
echo "  FALLBACK_REGISTRIES='https://npm.your-company.local https://registry.npmjs.org' $0 ${packages[*]}"
exit 1
