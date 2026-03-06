# MurMur AI Agent Monorepo

Production-minded TypeScript monorepo for et AI-agent-system med tydelige prosessgrenser:
- **Ingress:** API
- **Execution:** Worker + Orchestrator graph
- **Capabilities:** Tool-executor, Sandbox, Memory-store
- **Infra:** Redis queue + Postgres database

## Stack
- pnpm workspaces
- TypeScript
- Next.js (web)
- Fastify (api/orchestrator/tool-executor/sandbox/memory-store)
- BullMQ + Redis
- Prisma + Postgres

## Repository structure

- `apps/` kjørbare prosesser
  - `web`, `api`, `worker`, `orchestrator`, `tool-executor`, `sandbox`, `memory-store`
- `packages/` delte capabilities
  - `shared`, `db`, `queue`, `graph`, `planner-agent`, `builder-agent`, `reviewer-agent`, `optimizer-agent`

---

## How to use (quick start)

### 1) Start everything
```bash
cp .env.example .env
pnpm docker:up
```

### 2) Open UI
- Web app: <http://localhost:3000>

### 3) Start a workflow from terminal (optional)
```bash
curl -X POST http://localhost:4000/workflows \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Build a robust agent plan for release readiness"}'
```

### 4) Check workflow status
```bash
curl http://localhost:4000/workflows/<WORKFLOW_ID>
```

### 5) Inspect workflow events
```bash
curl http://localhost:4000/workflows/<WORKFLOW_ID>/events
```

### 6) Cancel a workflow
```bash
curl -X POST http://localhost:4000/workflows/<WORKFLOW_ID>/cancel
```

### 7) Stop everything
```bash
pnpm docker:down
```

---

## Health endpoints
- API: `GET /health` on `:4000`
- Orchestrator: `GET /health` on `:4001`
- Tool Executor: `GET /health` on `:4002`
- Sandbox: `GET /health` on `:4003`
- Memory Store: `GET /health` on `:4004`

---

## Architecture rules
- Apps can depend on packages.
- Packages cannot depend on apps.
- API remains a thin ingress (validate + enqueue + read models).
- Worker owns async background execution.
- Orchestrator owns workflow graph control flow.
- Tool-executor, sandbox, and memory-store are isolated service boundaries.

---

## Local (without Docker)

```bash
pnpm install
pnpm --filter @murmur/db prisma:generate
pnpm --filter @murmur/db prisma:push
pnpm dev
```

## Root scripts
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm docker:up`
- `pnpm docker:down`
