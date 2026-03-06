# MurMur Orchestrator (DB-enforced state machine)

This directory contains a production-shaped orchestrator backend with:

- Postgres schema for runs/events/agent runs/evaluations/approvals/tasks/artifacts/project memory.
- DB transition guard (`runs_state_transitions` + trigger).
- Atomic transition function (`transition_run_state`) and run creation helper (`create_run`).
- FastAPI and Node/Express route skeletons wired to DB functions.

## Start

```bash
cd orchestrator
docker compose up --build
```

Services:
- Postgres: `localhost:5432`
- FastAPI: `localhost:8000`
- Node: `localhost:3000`

## Migrations

Migrations are plain SQL files in `db/migrations`:

1. `0001_init_orchestrator.sql`
2. `0002_optional_pgvector.sql`
3. `0003_state_transition_guard.sql`
4. `0004_transition_fn.sql`

To run manually:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_init_orchestrator.sql
psql "$DATABASE_URL" -f db/migrations/0002_optional_pgvector.sql
psql "$DATABASE_URL" -f db/migrations/0003_state_transition_guard.sql
psql "$DATABASE_URL" -f db/migrations/0004_transition_fn.sql
```

## SQL smoke tests

```sql
-- Create a run
SELECT (create_run(gen_random_uuid(), NULL, NULL, 'hello', 'en', '{}'::jsonb, NULL)).run_id;

-- Valid transition
SELECT transition_run_state('<RUN_ID>', 'CONTEXT_ASSEMBLED', 'run.context_assembled', 'system', '{}'::jsonb);

-- Invalid transition (fails with SQLSTATE 23514)
SELECT transition_run_state('<RUN_ID>', 'EXECUTED', 'run.executed', 'system', '{}'::jsonb);
```

## API routes

Both FastAPI and Node implement:

- `POST /v1/runs` (supports `Idempotency-Key` header and calls `create_run`)
- `GET /v1/runs/:id`
- `POST /v1/runs/:id/approve` (calls `transition_run_state(..., 'APPROVED', ...)`)
- `POST /v1/runs/:id/deny` (calls `transition_run_state(..., 'CANCELLED', ...)`)
- `POST /v1/events` (if `to_state` is provided, performs DB-backed state transition via `transition_run_state`)

All run state transitions are DB-backed via `transition_run_state`.
