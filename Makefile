SHELL := /usr/bin/env bash

.PHONY: bootstrap test codex-pr-loop

bootstrap:
	@set -euo pipefail; \
	echo "[bootstrap] Installing Node dependencies"; \
	pnpm install; \
	echo "[bootstrap] Running baseline validation"; \
	pnpm run lint; \
	pnpm run typecheck

test:
	@set -euo pipefail; \
	pnpm run lint; \
	pnpm run typecheck; \
	pnpm run simulate:agents

codex-pr-loop:
	@set -euo pipefail; \
	./scripts/codex-safe-pr-loop.sh
