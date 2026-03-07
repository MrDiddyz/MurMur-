# MurMur Orchestrator (DB-enforced State Machine)

This folder contains a production-shaped orchestrator skeleton with:

- Postgres schema for runs, run_events, agent_runs, evaluations, approvals, tasks, artifacts, project_memory
- DB-level state machine transition guard using `runs_state_transitions` + trigger
- Atomic transition function `transition_run_state(...)`
- Convenience run creation function `create_run(...)`
- FastAPI and Node/Express route skeletons that call the DB functions
- Docker Compose stack with Postgres + migration runner + both APIs

## Run

```bash
cd orchestrator
docker compose up --build
```

Services:
- FastAPI: `http://localhost:8000`
- Node: `http://localhost:8001`
- Postgres: `localhost:5432`

## Migrations

Migration files:

- `db/migrations/0001_init_orchestrator.sql`
- `db/migrations/0002_optional_pgvector.sql`
- `db/migrations/0003_state_transition_guard.sql`
- `db/migrations/0004_transition_fn.sql`

## Required SQL checks

```sql
-- Create run
SELECT (create_run(gen_random_uuid(), NULL, NULL, 'hello', 'en', '{}'::jsonb, NULL)).run_id;

-- Valid transition
SELECT transition_run_state('<RUN_ID>', 'CONTEXT_ASSEMBLED', 'run.context_assembled', 'system', '{}'::jsonb);

-- Invalid transition (fails with SQLSTATE 23514)
SELECT transition_run_state('<RUN_ID>', 'EXECUTED', 'run.executed', 'system', '{}'::jsonb);
```

## API endpoints

Both APIs expose:

- `POST /v1/runs` (supports `Idempotency-Key` header)
- `GET /v1/runs/:id`
- `POST /v1/runs/:id/approve`
- `POST /v1/runs/:id/deny`
- `POST /v1/events`

All state changes call `transition_run_state(...)` in Postgres.
