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

## TikTok Webhook Configuration (Publish Updates)

The billing/API service exposes a TikTok webhook receiver for publish status updates:

- `POST /webhooks/tiktok`
- `GET /webhooks/tiktok/health`

### Verification flow

1. TikTok sends:
   - `X-Tt-Signature`
   - `X-Tt-Timestamp`
   - raw JSON request body
2. Server validates HMAC-SHA256 with `TIKTOK_WEBHOOK_SECRET` over:
   - `${timestamp}.${rawBody}`
3. Requests are rejected when:
   - signature is missing
   - timestamp is older than 5 minutes
   - signature mismatch
4. Replay/idempotency protection is enforced via `webhook_events(event_id)`.

### TikTok Developer Portal setup

1. In TikTok Developer Portal, open your app's Webhook/Event subscription settings.
2. Set callback URL to your deployed API endpoint:
   - `https://<your-domain>/webhooks/tiktok`
3. Subscribe to the `publish.status_change` event.
4. Configure the same signing secret in both places:
   - TikTok portal signing secret
   - service env var `TIKTOK_WEBHOOK_SECRET`
5. Verify health endpoint for ops checks:
   - `https://<your-domain>/webhooks/tiktok/health`

## Verification Pack

A repeatable verification suite is available to validate queue processing, webhook auth/idempotency, token-expiry simulation, DB assertions, and ML sanity checks.

### Local run

1. Ensure Docker + Docker Compose are installed.
2. Run:
   - `npm run verify:e2e`
   - `npm run verify:webhook`
   - `npm run verify:ml`
   - or all at once: `npm run verify:all`
3. Optional DB diagnostics:
   - `docker compose -f murmur-stronghold/docker-compose.yml exec -T postgres psql -U murmur -d murmur -f - < scripts/assert_db.sql`
4. Optional TikTok token expiry simulation:
   - `docker compose -f murmur-stronghold/docker-compose.yml exec -T postgres psql -U murmur -d murmur -f - < scripts/simulate_token_expiry.sql`

### Required environment variables

Defaults are provided for local verification scripts, but CI/real environments should set:

- `DATABASE_URL`
- `REDIS_HOST`
- `CORE_URL`
- `JWT_SECRET`
- `TIKTOK_WEBHOOK_SECRET`
- `WEBHOOK_URL` (optional; defaults to `http://localhost:3001/webhooks/tiktok`)

### Troubleshooting checklist

- Billing health fails:
  - Check `docker compose -f murmur-stronghold/docker-compose.yml ps`
  - Check logs: `docker compose -f murmur-stronghold/docker-compose.yml logs billing`
- Worker not completing jobs:
  - Verify `CORE_URL` reaches core service from worker (`http://core:8000` in compose)
  - Inspect worker logs for retries/dead-letter behavior
- Webhook tests failing:
  - Confirm `TIKTOK_WEBHOOK_SECRET` matches API secret
  - Confirm webhook timestamp skew is within 5 minutes
- DB assertions failing:
  - Run `scripts/assert_db.sql` directly to inspect latest rows and counts
