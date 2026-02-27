# MurMur Core (v0.3 starter)

GitHub-ready monorepo skeleton for:
- **Next.js terminal UI** (`apps/terminal-web`)
- **WebSocket session gateway** (`services/session-gateway`)
- **Existing Python core API** (`services/core`)
- **Infra + SQL** (`infra`)

## Repo structure

```text
murmur-core/
├─ apps/
│  └─ terminal-web/           # Next.js terminal client over WebSocket
├─ services/
│  ├─ core/                   # Existing Python orchestrator service
│  └─ session-gateway/        # Node/TS WebSocket + Docker session spawner + Prisma
└─ infra/
   ├─ docker-compose.yml      # Local stack incl. Postgres
   └─ sql/
      └─ 001_rbac.sql         # Prisma-compatible RBAC/session tables + seed data
```

## Quick start

```bash
cd murmur-core/infra
docker compose up --build
```

Then open:
- Terminal UI: `http://localhost:3001`
- Session gateway health: `http://localhost:8787`
- Python core docs: `http://localhost:8080/docs`

## RBAC behavior (gateway)

The browser connects to:
- `ws://localhost:8787/ws?email=<user-email>`

Gateway uses Prisma (`DATABASE_URL`) and enforces permissions from DB:
- `viewer`: `session.read`
- `operator`: `session.read`, `session.start`, `session.stdin`
- `admin`: all of the above + `session.stop`

## Prisma model alignment

`services/session-gateway/prisma/schema.prisma` defines:
- `User` (belongs to one `Role`)
- `Role` (has many `Permission` rows and `User`s)
- `Permission` (action scoped per role)
- `Session` (tracks active session container id per user)

Seed SQL inserts default roles/permissions and a local bootstrap user:
- `admin@murmur.local`

## Notes

- `session-gateway` mounts `/var/run/docker.sock` in docker-compose to spawn disposable containers.
- Starter command in UI launches `alpine:3.20` and loops over stdin lines.
- Run `npx prisma generate` inside `services/session-gateway` after dependency install.
