# Verification Gate (No PR without evidence)

Use this gate for riskier-than-normal changes.

## Required process
1. List exact commands to run **before** making code changes.
2. Run baseline checks (optional but recommended).
3. Make the minimal change.
4. Run the full quality gate.
5. If any check fails, fix and rerun checks until green.

## Required output evidence
- Commands run (exact)
- Evidence summary (pass/fail and key output)
- Remaining risks (if any)

## Suggested command template
```bash
git status --short
# language/project checks (examples)
pytest -q
npm test -- --runInBand
npm run lint
```

## PR policy
Do not open a PR without including verification evidence.
