# MurMur AI Agent Platform Monorepo

A runnable TypeScript monorepo scaffold for an AI agent platform with clear process/package boundaries.

## Structure

- `apps/web`: Next.js UI for starting workflows and viewing workflow state.
- `apps/api`: Fastify ingress for workflow CRUD/status + queueing.
- `apps/worker`: BullMQ worker that executes workflows via orchestrator and persists state.
- `apps/orchestrator`: Fastify orchestration service exposing `POST /run-workflow`.
- `apps/tool-executor`: Internal mock tool APIs with API key protection.
- `apps/sandbox`: Internal mock TypeScript execution API.
- `apps/memory-store`: Memory CRUD/search service.

- `packages/shared`: Shared schemas/types/env helpers.
- `packages/db`: Prisma schema + repository helpers.
- `packages/queue`: BullMQ queue + processor helpers.
- `packages/graph`: Deterministic graph runner (planner->builder->reviewer loop->optimizer).
- `packages/*-agent`: mock deterministic agent capabilities.

## Prerequisites

- Docker + Docker Compose
- Node 20+
- pnpm 9+

## Environment

```bash
cp .env.example .env
```

Important vars:
- `DATABASE_URL`
- `REDIS_URL`
- `INTERNAL_API_KEY`
- `ORCHESTRATOR_URL`
- `NEXT_PUBLIC_API_URL`

## Start locally (one command after env setup)

```bash
docker compose up --build
```

This launches web (3000), api (10000), worker, orchestrator, tool-executor, sandbox, memory-store, redis, and postgres with hot reload using bind mounts.

## Workflow lifecycle

1. User starts workflow from web.
2. Web calls `POST /workflows` on api.
3. API creates DB row + enqueue BullMQ job.
4. Worker consumes job and calls orchestrator.
5. Orchestrator runs graph: planner -> builder -> reviewer -> loop if rejected -> optimizer.
6. Worker persists events/checkpoints/result + status.
7. Web polls details/events by workflow id.

## Useful local commands

```bash
pnpm install
pnpm --filter @murmur/db prisma:generate
pnpm --filter @murmur/db prisma:migrate:deploy
pnpm build
pnpm typecheck
```

## Example curl commands

Create workflow:
```bash
curl -X POST http://localhost:10000/workflows \
  -H 'content-type: application/json' \
  -d '{"prompt":"Build a docs indexer","maxIterations":3}'
```

Get workflow status:
```bash
curl http://localhost:10000/workflows/<workflowId>
```

Get workflow events:
```bash
curl http://localhost:10000/workflows/<workflowId>/events
```

Create memory:
```bash
curl -X POST http://localhost:4005/memories \
  -H 'content-type: application/json' \
  -d '{"workflowId":"<workflowId>","content":"remember this detail","tags":["note"]}'
```

Search memory:
```bash
curl 'http://localhost:4005/memories/search?q=detail'
```
