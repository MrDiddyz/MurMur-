# MurMur Build Architecture (Phase-First Workflow)

This document defines a strict workflow for delivering new features in MurMur:

1. **Design architecture first** (boundaries, contracts, risks).
2. **Generate files one by one** in dependency order.
3. Validate each file before moving to the next.

## 1. Architecture-first checklist

Before writing any implementation file, define:

- Feature goal and non-goals.
- Affected domains (frontend, backend, data, orchestration, docs).
- Public contracts (API endpoints, events, DB schema changes).
- Runtime constraints (security, latency, observability).
- Rollout and rollback strategy.

## 2. Layered structure

Use this layering for any new feature:

- **Interface layer**: UI, CLI, or API handlers.
- **Application layer**: orchestration and use-case logic.
- **Domain layer**: pure business rules.
- **Infrastructure layer**: DB, queues, external providers.
- **Cross-cutting layer**: auth, telemetry, policy checks.

## 3. File generation order

Generate files in this order:

1. Contracts/spec files (`docs/`, OpenAPI, typed interfaces).
2. Domain models and validation.
3. Application services.
4. Infrastructure adapters.
5. Interface handlers/components.
6. Tests (unit → integration).
7. Operational docs (runbooks, migration notes).

## 4. Definition of done

A change is complete only when:

- Contracts and implementation match.
- Tests pass locally for touched areas.
- Operational notes are updated.
- Risk and rollback notes are documented.
