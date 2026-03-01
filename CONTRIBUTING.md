# Contributing to Murmur Nala Reflection OS

Thank you for helping build the next generation of reflective intelligence systems.

## Workflow

1. Fork and create a feature branch.
2. Install dependencies with `npm install`.
3. Run quality gates before opening a pull request:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
4. Open a PR with a clear summary, architectural context, and validation notes.

## Standards

- Prefer small, reviewable pull requests.
- Keep business logic in `packages/core` and UI concerns in `apps/web`.
- Add or update tests when behavior changes.
- Document any new environment variables or operational requirements.

## Commit conventions

Use descriptive commit messages that convey intent and scope.

Example:

- `feat(core): add reflective domain registry`
- `chore(ci): tighten workspace build validation`
