# Architecture Overview

This document is the living architecture reference for the MurMur monorepo. It is intended to help new contributors quickly understand the system boundaries, major components, and where responsibilities live.

## 1. Project Structure

The repository is organized as a monorepo with several product surfaces and platform subsystems.

```text
MurMur-/
├── src/                          # Primary Next.js app routes/components for the main MurMur surface
├── apps/web/                     # Additional web app surface and API routes (App Router)
├── modules/                      # Python module implementations (memory/synthesis/listener/etc.)
├── agents/                       # Role-specialized agent runtime definitions
├── core/                         # Core platform primitives (event bus + memory store)
├── murmur-intelligence-core/     # Prompt registry, schemas, and decision governance assets
├── murmur-core/                  # Python service packages (core services)
├── murmur-stronghold/            # Security/runtime hardening services and worker packages
├── murmur-security-interactive/  # Security-focused interface/assets
├── MurMurMovieApp/               # Swift iOS app surface
├── db/                           # SQL schema/bootstrap assets
├── supabase/                     # Supabase migrations/config
├── docs/                         # Architecture, strategy, and operations documentation
├── scripts/                      # Local automation and simulation scripts
├── tests/                        # Python unit tests
├── .github/                      # CI/CD workflows and repository automation
├── package.json                  # Root JS dependencies/scripts
└── ARCHITECTURE.md               # This document
```

## 2. High-Level System Diagram

```text
[Operators / End Users]
          |
          v
[Web + App Interfaces]
  - src/ Next.js UI
  - apps/web Next.js UI/API
  - MurMurMovieApp iOS client
          |
          v
[Orchestration + Agent Layer]
  - agents/
  - modules/
  - scripts/agent-simulation.mjs
          |
          +------------------------------+
          |                              |
          v                              v
[Memory + Event Primitives]         [Intelligence Governance]
  - core/memory                      - murmur-intelligence-core/prompts
  - core/event_bus                   - murmur-intelligence-core/schemas
          |                              |
          +---------------+--------------+
                          |
                          v
               [Data + Platform Services]
                - db/*.sql
                - supabase/*
                - murmur-core / murmur-stronghold services
                          |
                          v
               [External Integrations]
                - Stripe (billing events)
                - Cloud infra services (AWS/GCP style deployment)
```

## 3. Core Components

### 3.1. Frontend

**Name:** MurMur Web Interfaces + iOS Surface

**Description:**
- Main product UI in `src/` (Next.js App Router).
- Additional web/API surface in `apps/web/`.
- Native iOS experience in `MurMurMovieApp/`.

**Technologies:** Next.js 14, React 18, TypeScript, Tailwind CSS, SwiftUI.

**Deployment:** Primarily web runtime deployment patterns (Node/Next hosting), with iOS distributed separately.

### 3.2. Backend Services

#### 3.2.1. Orchestration & Agent Runtime

**Name:** Agent/Module Runtime Layer

**Description:** Coordinates specialized agent behaviors, module execution, and simulation loops.

**Technologies:** Python modules (`modules/`, `agents/`), JavaScript orchestration scripts (`scripts/`).

**Deployment:** Container/service deployment model (documented for AWS/GCP-style stacks in `docs/architecture.md`).

#### 3.2.2. Intelligence Governance Service

**Name:** murmur-intelligence-core

**Description:** Stores governed prompt assets, JSON schemas, decision templates, and validation scripts.

**Technologies:** JSON Schema, YAML prompt specs, Node.js validation scripts.

**Deployment:** Packaged with platform services and CI validation.

#### 3.2.3. Security / Stronghold Services

**Name:** murmur-stronghold + murmur-security-interactive

**Description:** Security-hardening workloads and related security-oriented interfaces/artifacts.

**Technologies:** Python service packages and web assets.

**Deployment:** Service/container deployment depending on environment profile.

## 4. Data Stores

### 4.1. Relational / SQL State

**Name:** Platform transactional/state stores

**Type:** PostgreSQL-style relational storage (plus Supabase-managed schemas/migrations).

**Purpose:** Workflow state, platform metadata, and governed records.

**Key Schemas/Collections:** SQL bootstrap assets in `db/` and migration assets in `supabase/`.

### 4.2. Memory / Cache / Event Support

**Name:** Memory + Event primitives

**Type:** In-process abstractions in `core/memory` and `core/event_bus` with deployable cache/bus options documented in architecture docs.

**Purpose:** Preserve observations/outcomes and coordinate asynchronous platform behavior.

## 5. External Integrations / APIs

- **Stripe**
  - **Purpose:** Billing/subscription event ingestion and consistency workflows.
  - **Integration Method:** Webhook/event flows (documented in architecture docs).
- **Cloud Infrastructure Services (AWS/GCP class)**
  - **Purpose:** Load balancing, compute orchestration, managed data stores, secrets, and observability.
  - **Integration Method:** Managed cloud service APIs/resources.

## 6. Deployment & Infrastructure

**Cloud Provider:** Cloud-agnostic with documented AWS/GCP reference topologies.

**Key Services Used:** Load balancers/WAF, container orchestration, PostgreSQL, Redis-class caching, object storage, IAM/KMS/secrets, observability stacks.

**CI/CD Pipeline:** GitHub Actions (`.github/workflows`).

**Monitoring & Logging:** Centralized logs/metrics/traces per environment, with cloud-native monitoring integrations.

## 7. Security Considerations

**Authentication:** Identity-provider-backed auth model (JWT/token-based flows referenced in architecture docs).

**Authorization:** RBAC + policy gates for high-consequence actions.

**Data Encryption:** TLS in transit and cloud KMS-backed encryption-at-rest patterns.

**Key Security Tools/Practices:** WAF, secrets isolation, audit trails, environment separation (Dev/Stage/Prod), governance-first decision tracking.

## 8. Development & Testing Environment

**Local Setup Instructions:**
1. Install dependencies at repository root: `npm install`
2. Run local web app: `npm run dev`
3. Execute checks: `npm run lint`, `npm run typecheck`, plus Python tests in `tests/`.

**Testing Frameworks:**
- JavaScript/TypeScript checks via Next.js lint + TypeScript compiler.
- Python tests under `tests/` (pytest-style).

**Code Quality Tools:** ESLint, TypeScript type-checking, schema validation scripts in `murmur-intelligence-core/scripts/`.

## 9. Future Considerations / Roadmap

- Continue consolidating orchestration interfaces behind stable service contracts.
- Expand decision/prompt governance assets and validation depth.
- Strengthen multi-tenant isolation and policy-aware memory partitioning.
- Advance simulation-first workflows tied to production guardrails.

## 10. Project Identification

**Project Name:** MurMur

**Repository URL:** (local repository in this environment)

**Primary Contact/Team:** MurMur core platform team

**Date of Last Update:** 2026-03-02

## 11. Glossary / Acronyms

- **RBAC:** Role-Based Access Control.
- **RLS:** Row-Level Security.
- **CI/CD:** Continuous Integration / Continuous Delivery.
- **SLO:** Service Level Objective.
- **WAF:** Web Application Firewall.
