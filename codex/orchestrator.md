# CODEX ORCHESTRATOR

This file defines the execution contract for builder-style coding agents.

## Objective

Complete tasks with minimal, safe, verifiable changes.

## Mandatory repository contract

Before making decisions, assume:

- `npm run verify` is the repository truth
- `docs/AGENT_WORKFLOW.md` defines workflow behavior
- `AGENTS.md` defines repository-wide agent rules

## Builder agent workflow

For every task, do the following in order:

1. Read the task carefully.
2. Inspect only the files most likely related to the task.
3. Make the smallest relevant code change.
4. Run:

   ```bash
   npm run verify
   ```

5. Summarize what changed and why.

## Creative mode override

If the user explicitly requests **creative mode**, keep the same safety baseline while:

- fixing the core bug first
- adding a high-value enhancement (clarity, ergonomics, or guardrails)
- still ending with `npm run verify`
