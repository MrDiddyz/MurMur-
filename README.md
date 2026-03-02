# MurMur

MurMur is a modular intelligence platform for operating high-consequence workflows with auditable AI assistance. It combines orchestration, persistent memory, simulation, and policy enforcement so teams can move from one-off prompts to repeatable decision systems.

This repository is a multi-surface codebase: product interfaces, orchestration services, intelligence assets, security tooling, and deployment scaffolding.

## Vision

MurMur is built for organizations that require **operationally reliable AI**, not just conversational output. The platform vision is to:

- Turn fragmented AI usage into governed, end-to-end workflows.
- Create memory-backed systems that improve with every execution cycle.
- Support simulation-first planning before expensive real-world action.
- Preserve human control through explicit policies, review paths, and traceability.

## Architecture

MurMur is designed as a layered system:

1. **Experience Layer** — Next.js applications and dashboards for operators and stakeholders.
2. **Orchestration Layer** — task routing, execution lifecycle management, and agent coordination.
3. **Intelligence Layer** — prompt registry, decision templates, reflective loops, and simulation assets.
4. **Memory + Data Layer** — durable stores for observations, decisions, outcomes, and policy state.
5. **Security + Policy Layer** — authorization checks, secret management, audit logging, and hardening controls.
6. **Infrastructure Layer** — cloud runtime, CI/CD, observability, and deployment automation.

For detailed diagrams and deployment topologies, see [`docs/architecture.md`](docs/architecture.md).

## Modules

The repository is intentionally modular. Key areas include:

- `src/` — primary application routes and UI surfaces (including dashboard, solutions, and product modules).
- `core/` — memory and event bus primitives used by orchestration logic.
- `agents/` — specialized agent definitions and runtime behavior components.
- `modules/` — domain extensions and packaged capability units.
- `murmur-intelligence-core/` — prompt registry, decision schemas, and validation scripts.
- `murmur-stronghold/` and `murmur-security-interactive/` — security-focused assets and hardening artifacts.
- `docs/` — architecture records, strategy docs, and operational guidance.
- `tests/` — automated checks and validation scaffolding.

## Roadmap

### Near-term (0-2 quarters)

- Consolidate orchestration interfaces behind stable service contracts.
- Expand decision schema coverage for product, security, and operations workflows.
- Harden deployment baselines with stricter identity boundaries and audit retention defaults.
- Publish operator runbooks for incident handling and model rollback.

### Mid-term (2-4 quarters)

- Introduce simulation-driven planning loops tied directly to production policy gates.
- Improve multi-tenant isolation and per-tenant memory partitioning.
- Add deeper observability: latency budgets, decision-quality metrics, and failure taxonomies.

### Long-term (4+ quarters)

- Build adaptive optimization loops that continuously refine workflows with policy-safe reinforcement.
- Support regulated deployment profiles (e.g., sector-specific controls and reporting templates).
- Enable hybrid cloud + edge execution for latency-sensitive environments.

## Security

MurMur follows a defense-in-depth operating model:

- **Identity-first access control**: least privilege for users, services, and automation.
- **Secret hygiene**: environment-level secret isolation and rotation-ready integration points.
- **Data governance**: scoped persistence, explicit retention strategy, and deletion workflows.
- **Execution safety**: policy checks before high-impact actions and explicit audit trails.
- **Supply-chain awareness**: dependency scanning, CI validation, and reproducible build targets.

Security implementation details evolve as the platform matures; current hardening references are tracked in `docs/` and security-focused submodules.

## Cross-Learning Engine

MurMur now supports a hybrid cross-learning loop for multi-account reinforcement-style training.

### Knowledge transfer flow

- Each account keeps a personalized model in `data/models/accounts/<account_id>.json`.
- A shared global model is stored at `data/models/global_model.json` and is trained from aggregated replay data.
- If an account model does not exist yet, it is initialized from the global model so new accounts inherit prior learning quickly.

### Why hybrid (global + account) is used

- **Global model** captures broad patterns that generalize across accounts.
- **Account models** preserve local behavior and per-account style.
- The system applies a **soft update** when global quality improves:
  - `account_weights = 0.8 * account_weights + 0.2 * global_weights`
- This lets accounts benefit from system-wide learning without losing personalization abruptly.

### Cluster-aware transfer and negative-transfer mitigation

- Cluster models are maintained in `data/models/cluster_models/` using:
  - follower-count bucket (`small`, `medium`, `large`)
  - niche category
- Accounts share partial weights with peers in the same cluster only.
- This reduces negative transfer by limiting cross-account influence to behaviorally similar cohorts.
- Global updates are periodic via `GLOBAL_UPDATE_INTERVAL` (default `50`) to avoid overreacting to noisy short-term data.

### Config flags

- `ML_GLOBAL_ENABLED=true`
- `ML_CLUSTER_ENABLED=true`
- `GLOBAL_UPDATE_INTERVAL=50`
