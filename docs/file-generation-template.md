# File-by-File Generation Template

Use this template whenever implementing a new MurMur feature.

## Step 0: Architecture note (required)

Create a short architecture note with:

- Problem statement
- Proposed layers/components
- Data and API contracts
- Risks and mitigations

## Step 1: Create one file at a time

For each file:

1. Name the file and explain purpose in one sentence.
2. Implement only that file.
3. Run the smallest relevant check.
4. Record status before moving forward.

### File status log format

```md
- [x] path/to/file.ext — purpose — check run
```

## Step 2: Sequence guidance

Preferred sequence:

1. `docs/<feature>-architecture.md`
2. `src/domain/...`
3. `src/application/...`
4. `src/infrastructure/...`
5. `src/interface/...`
6. `tests/...`
7. `docs/<feature>-runbook.md`

## Step 3: Final verification

- Run project tests for impacted packages.
- Confirm no generated artifacts are accidentally committed.
- Verify documentation references real file paths.
