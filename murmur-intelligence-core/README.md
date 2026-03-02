# murmur-intelligence-core

Initial scaffold for prompts, schemas, decisions, and scripts.

## Structure
- prompts/strategy/market_scan.v1.0.0.yaml
- prompts/strategy/positioning_brief.v1.0.0.yaml
- prompts/ops/weekly_execution_plan.v1.0.0.yaml
- prompts/dev/architecture_review.v1.0.0.yaml
- prompts/agents/reflection_loop.v1.0.0.yaml
- schemas/prompt.schema.json
- schemas/decision.schema.json
- schemas/clinic-ai-knowledge-router.schema.json
- knowledge-base/clinic-ai-knowledge-router.sandra-constance.nb-NO.json
- decisions/templates/DEC-template-architecture.json
- decisions/templates/DEC-template-product.json
- decisions/templates/DEC-template-security.json
- decisions/templates/DEC-template-ops.json
- decisions/templates/DEC-template-prompt-change.json
- scripts/validate_registry.js
- scripts/validate_decisions.js
- registry.json
- CODEX.md

## Validation
- Run `node murmur-intelligence-core/scripts/validate_clinic_knowledge_router.js` to validate the clinic knowledge-router config against its schema.
- Runtime endpoint for Vercel/Netlify-compatible Next.js deployments: `GET /api/clinic-ai/router` (served from `src/app/api/clinic-ai/router/route.ts`).
