# Murmur Nala Reflection OS

Murmur Nala Reflection OS is a venture-scale intelligence platform for building reflective, agent-powered learning systems. This Turborepo provides a production-oriented foundation that separates customer-facing experiences from durable domain logic, enabling rapid product iteration without compromising reliability.

## Why this architecture

- **Capital-efficient velocity:** Shared packages keep product and research teams shipping from one source of truth.
- **Operational discipline:** Turborepo task orchestration enforces consistent lint, type safety, and build standards.
- **Extensible intelligence layer:** Domain and agent primitives in `@murmur/core` support fast expansion into new reflection workflows.

## Repository layout

- `apps/web` — Next.js App Router application with Tailwind CSS.
- `packages/core` — Domain models and core agent definitions powering the platform.
- `.github/workflows/ci.yml` — Continuous integration pipeline for lint, typecheck, and build.

## Quickstart

```bash
npm install
npm run dev
```

## Core commands

```bash
npm run lint
npm run typecheck
npm run build
```

## Production posture

This repository is designed for scaling teams and institutional-grade delivery:

- Strict TypeScript configurations in app and package boundaries.
- CI task gating across all workspaces.
- Deterministic monorepo automation via Turborepo.

## Governance

Please read the following before contributing:

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [License Placeholder](./LICENSE)
