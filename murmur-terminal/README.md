# MurMur Cloud Terminal Constellation (MVP)

Secure cloud-native browser terminal with RBAC, dockerized per-session shells, and a node registry brain.

## Monorepo layout

- `apps/web` - Next.js terminal UI (xterm.js + mobile command bar)
- `apps/server` - WebSocket terminal gateway + Docker session lifecycle
- `apps/node-registry` - Fastify + Prisma API for node records and dev token minting
- `packages/murmur-cli` - `murmur` CLI used inside session containers
- `docker/session.Dockerfile` - hardened non-root session image
- `prisma/schema.prisma` - RBAC, Sessions, Nodes schema

## Environment

Required variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `MURMUR_API`
- `NODE_ENV`

Copy `.env.example` to `.env` for local dev defaults.

## Local run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev:registry
npm run dev:server
npm run dev:web
```

## Docker Compose run

```bash
docker compose build
docker compose up -d
```

`node-registry` runs migrations + seed automatically at start.

## Dev auth bootstrap

Default seeded users:

- `operator@murmur.dev` (`operator`)
- `architect@murmur.dev` (`architect`)
- `a7@murmur.dev` (`a7`)

Mint a development token:

```bash
curl "http://localhost:8081/dev/token?email=operator@murmur.dev"
```

Store token in browser for terminal page:

```js
localStorage.setItem('murmur_token', '<JWT>')
```

## API (MVP)

- `GET /health` -> `{ ok: true }`
- `GET /dev/token?email=...` (development only)
- `POST /nodes` (JWT, `node:create:self`)
- `GET /nodes` (JWT, `node:list:self`)
- `PATCH /nodes/:id/status` (JWT, `node:status:update`)

JWT payload expected from dev mint:

```json
{
  "sub": "<user-id>",
  "roles": ["operator"],
  "permissions": ["node:create:self", "node:list:self", "session:open:self"]
}
```

## Security defaults

Terminal session containers are spawned with:

- `--cap-drop=ALL`
- `--security-opt no-new-privileges:true`
- `--read-only` + `--tmpfs /tmp`
- `--pids-limit 256`
- `--memory 512m`
- `--cpus 1.0`

Session lifecycle:

- one container per WS connection
- destroy on disconnect
- destroy on idle timeout (30 min)
- audit logs emitted for start/close/timeout + node API events

Role behavior:

- `operator`: restricted `murmur-shell` (no direct bash)
- `architect` / `a7`: bash shell inside session container

## VPS deployment (Ubuntu 22.04)

1. Install Docker Engine + Compose plugin.
2. Clone repo and set production `.env` values.
3. Set `NODE_ENV=production` to disable `/dev/token` route.
4. Run `docker compose up -d --build`.
5. Front with Caddy for HTTPS proxying to web/API.
6. Lock firewall to `22,80,443`.
7. Ensure `pgdata` volume is persisted/backed up.

## Smoke checks

```bash
curl http://localhost:8081/health
curl "http://localhost:8081/dev/token?email=operator@murmur.dev"
curl http://localhost:8080
curl http://localhost:3000
```
