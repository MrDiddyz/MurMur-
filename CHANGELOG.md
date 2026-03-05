# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-05

### Added
- Added an avatar operator API endpoint with task-specific JSON outputs for backend task handling (`228b45d`).
- Added LinkedIn profile badge script integration on the index page (`ef7e920`).
- Added a FastAPI boilerplate server structure for backend services (`29eecdc`).
- Added responsive iPhone touch controls and layout improvements in the game experience (`7a1e728`).
- Added an initial playable HTML+JavaScript game scaffold with associated build scripts (`731f411`).
- Added Supabase app schema support for profiles, projects, and jobs (`64df29b`).

### Changed
- Improved deployment/readiness workflows by introducing verification scripts and CI workflow updates (`dc325cb`).
- Expanded application architecture with a base Dockerized MurMur server skeleton and supporting orchestration (`de37be1`).

### Fixed
- Fixed clinic router validation and improved deploy-ready API behavior (`ec18b5e`).

### Security
- Added scope checks, admin login rate limiting, and audit logging for stronger access control and monitoring (`38563a3`).
- Added TikTok webhook signature verification to harden inbound webhook processing (`143b759`).

### Breaking Changes
- None identified in this release window.

### Upgrade Notes
- Backend and infrastructure operators should apply the latest database schema changes before deploying API services that depend on profiles/projects/jobs entities.
- Teams using webhook integrations should validate signing-secret configuration in environment variables before rollout.
