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

## Adaptive Posting Time Optimization (Thompson Sampling)

MurMur now includes a **multi-armed bandit posting-time model** that replaces fixed posting heuristics with adaptive learning.

### Why Thompson Sampling

Thompson Sampling balances:
- **Exploration**: trying under-tested posting hours to discover upside.
- **Exploitation**: preferring hours with stronger historical reward.

Each hour (`0-23`) is modeled as a bandit arm with Beta-distribution parameters:
- `alpha` tracks positive reward mass.
- `beta` tracks negative reward mass.

The scheduler samples each arm and chooses the highest sample.

### Exploration safety

To avoid early lock-in, the scheduler enforces uniform exploration until each arm has at least 5 trials.

### Reward formula (v1)

Reward is normalized and clamped to `[0,1]`:

```text
reward = 0.4 * normalized_views
       + 0.3 * normalized_likes
       + 0.3 * normalized_watch_time
```

This reward is persisted per post and used to update arm parameters after engagement metrics are collected.

### Feedback loop

1. Auto-scheduler selects posting hour with Thompson Sampling (or forced exploration).
2. Post is scheduled for next available day at that hour.
3. Engagement metrics are collected.
4. Reward is computed and arm updated:
   - `alpha += reward`
   - `beta += (1 - reward)`
   - `total_trials += 1`
   - `total_reward += reward`
