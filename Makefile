SHELL := /usr/bin/env bash

.PHONY: bootstrap test codex-pr-loop

bootstrap:
	@set -euo pipefail; \
	echo "[bootstrap] Installing Node dependencies"; \
	npm ci; \
	echo "[bootstrap] Running baseline validation"; \
	npm run lint; \
	npm run typecheck

test:
	@set -euo pipefail; \
	npm run lint; \
	npm run typecheck; \
	npm run simulate:agents

codex-pr-loop:
	@set -euo pipefail; \
	./scripts/codex-safe-pr-loop.sh
