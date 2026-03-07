# Repository Agent Rules

These rules apply to the entire repository unless a deeper `AGENTS.md` overrides them.

## Principles

- Make the smallest change that fully solves the task.
- Preserve existing behavior unless a behavior change is requested.
- Prefer clear, maintainable code over cleverness.

## Validation

- Treat `npm run verify` as the canonical repository check.
- If `npm run verify` cannot run due to environment limits, report that explicitly.

## Change hygiene

- Avoid unrelated refactors.
- Keep commits focused and descriptive.
- Update docs when introducing new workflow expectations.
