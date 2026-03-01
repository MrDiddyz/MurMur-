# MurMur Cloud Terminal

A distributed compute orchestration layer for autonomous AI agents.

MurMur Cloud Terminal provides the infrastructure to run, coordinate, and monitor agents across scalable cloud environments while preserving security, observability, and operability.

## Core Capabilities

- Agent lifecycle management (start, stop, restart, health)
- Secure goal execution with policy-aware controls
- Distributed task orchestration across worker pools
- Real-time telemetry, event streams, and logging
- WebSocket-based control channel for low-latency coordination
- Multi-tenant isolation and workspace boundaries

## Why This Exists

Modern autonomous systems need more than prompt-response interfaces. They require:

- Stateless execution for elastic scaling
- Identity verification and secure agent authorization
- Dynamic compute allocation for bursty workloads
- Persistent memory + outcome tracking for learning loops

MurMur Cloud Terminal is the execution substrate that makes production-grade agent systems reliable.

## Architecture

- **API Layer** (Fastify / Express): control plane and public endpoints
- **Execution Engine**: task dispatch, runtime management, retries, and supervision
- **WebSocket Control Gateway**: bidirectional command and status channel
- **Redis Event Bus**: fan-out messaging and ephemeral coordination
- **PostgreSQL / Supabase**: durable state, audit trails, and metadata
- **Kubernetes-ready deployment**: horizontal scaling and workload isolation

## Repository Structure

- `apps/web` — Next.js dashboard and control interface
- `apps/api` — API layer / orchestrator entrypoint
- `packages/core` — orchestration primitives and shared logic
- `packages/types` — shared TypeScript contracts
- `scripts` — utility and local simulation scripts

## Local Development

1. Copy `.env.example` to `.env` and configure required values.
2. Install dependencies.
3. Run development services.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Roadmap Status

- **Phase 1**: Agent execution + logging
- **Phase 2**: Multi-agent coordination
- **Phase 3**: Distributed Constellation Mesh
