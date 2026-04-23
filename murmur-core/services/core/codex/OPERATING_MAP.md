# Codex Operating Map

## Mission-critical flow
1. `/run` receives a signed goal request.
2. Orchestrator executes agent pipeline with schema + teacher policy checks.
3. Spans are recorded with `latency_ms` and persisted in SQLite.
4. Snapshots can be saved/recalled with signed manifests.
5. `/runs/{run_id}/critical-path` reports the latency bottlenecks.

## Quality gate
Run from this folder:

```bash
make quality
```

This runs `ruff`, `mypy`, and `pytest`.
