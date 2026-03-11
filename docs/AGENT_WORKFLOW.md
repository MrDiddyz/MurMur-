# Agent Workflow

This document defines the default execution loop for coding agents in this repository.

## Default mode (safe + minimal)

1. Understand the task and constraints.
2. Inspect only the most relevant files.
3. Propose the smallest valid change.
4. Implement the change.
5. Run verification via:

   ```bash
   npm run verify
   ```

6. Summarize file-level deltas and verification results.

## Creative mode (requested explicitly)

When the request asks for "creative mode", agents may expand the solution *without* violating safety:

1. Keep a clear core fix that addresses the bug directly.
2. Add one or more high-value enhancements (ergonomics, clarity, docs, guardrails).
3. Prefer reversible additions over risky rewrites.
4. Still finish by running:

   ```bash
   npm run verify
   ```

## Output quality bar

- Keep changes coherent and easy to review.
- Prefer explicit naming and readable structure.
- Report verification status clearly, including environment limitations.
