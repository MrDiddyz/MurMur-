# MurMur Orchestrator (DB-enforced State Machine)

This folder contains a minimal production-shaped orchestrator backend with:
- Postgres schema for runs/events/agent_runs/evaluations/approvals/tasks/artifacts.
- DB-level state machine guard (`runs_state_transitions` + `BEFORE UPDATE` trigger).
- Atomic state transition function (`transition_run_state`) and `create_run` helper.
- FastAPI and Node/Express skeleton APIs that call DB functions (no in-memory state).

## Structure

- `db/migrations/0001_init_orchestrator.sql`
- `db/migrations/0002_optional_pgvector.sql`
- `db/migrations/0003_state_transition_guard.sql`
- `db/migrations/0004_transition_fn.sql`
- `api/fastapi/*`
- `api/node/*`

## Run

```bash
cd orchestrator
docker compose up --build
```

## SQL Smoke Test

```sql
SELECT (create_run(gen_random_uuid(), NULL, NULL, 'hello', 'en', '{}'::jsonb, NULL)).run_id;
SELECT transition_run_state('<RUN_ID>', 'CONTEXT_ASSEMBLED', 'run.context_assembled', 'system', '{}'::jsonb);
SELECT transition_run_state('<RUN_ID>', 'EXECUTED', 'run.executed', 'system', '{}'::jsonb);
```

Expected:
- The second query succeeds.
- The third query fails with SQLSTATE `23514` and message `Invalid run state transition...`.

## API Endpoints

Both APIs expose:
- `POST /v1/runs` (supports `Idempotency-Key` header)
- `GET /v1/runs/:id`
- `POST /v1/runs/:id/approve`
- `POST /v1/runs/:id/deny`
- `POST /v1/events`

All transitions use the DB function:
`SELECT transition_run_state(run_id, '<STATE>', '<event>', 'system', '{...}');`
