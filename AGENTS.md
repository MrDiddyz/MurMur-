# AGENTS.md

## Scope
These instructions apply to the entire repository.

## Project intent
This repository contains **MurMur Auto Bot v0.4**, a monorepo for short-form content generation, scoring, and export-first posting workflows.

## Guardrails
- Keep secrets in environment variables only.
- Be explicit about automation boundaries:
  - Instagram Reels: API-ready request structure (requires app review + tokens).
  - YouTube Shorts: upload stub only.
  - TikTok and CapCut: semimanual export-first only.
- Prefer minimal, runnable code over speculative abstractions.
- Keep schema changes under `supabase/migrations`.

## Local quality checks
- Dashboard: `pnpm --filter dashboard lint && pnpm --filter dashboard build`
- Python: `python -m compileall services`
