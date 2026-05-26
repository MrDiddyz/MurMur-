# MurMur Cloud Terminal Constellation (MVP)

## Services
- **web** (Next.js): http://localhost:3000
- **server** (WebSocket gateway): ws://localhost:8080
- **node-registry** (Fastify + Prisma): http://localhost:8081
- **postgres**: localhost:5432

## Required environment variables
- `DATABASE_URL`
- `JWT_SECRET`
- `MURMUR_API`
- `NODE_ENV`
- optional: `AUDIT_LOG_PATH` (gateway audit log file path)

## Quick start
```bash
cd murmur-terminal
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
docker build -t murmur-session -f docker/session.Dockerfile .
docker compose up
```

## JWT payload shape
```json
{
  "sub": "<user-id>",
  "role": "operator|architect|a7"
}
```

## RBAC permissions (enforced)
- `operator`: `node:create`, `node:list`, `session:spawn:operator`
- `architect`: `node:create`, `node:list`, `node:status:update`, `session:spawn:admin`
- `a7`: `node:create`, `node:list`, `node:status:update`, `session:spawn:admin`

## Security defaults
- Session container runs as non-root `murmur` user.
- Session container uses read-only rootfs and tmpfs `/tmp`.
- Runtime hardening uses `--cap-drop=ALL` and `no-new-privileges`.
- Per-session resource limits (`cpus=1`, `memory=512m`, `pids=128`).
- Session auto-cleanup on socket close and 30-minute idle timeout.
- Operators are restricted to `murmur` CLI shell; admin roles can use `bash`.
- Node Registry writes audit events to `AuditLog` table; gateway writes JSONL audit logs.
- Production mode requires `JWT_SECRET` and disables insecure defaults.

## Deploy notes (Ubuntu 22.04)
1. Install Docker and Docker Compose plugin.
2. Expose only ports 22/80/443 in firewall.
3. Put Caddy in front of web + ws services and terminate TLS.
4. Keep Postgres data in `postgres-data` volume.
5. Persist `./logs` from gateway container for audit retention.
6. Use production JWT secret and database credentials.
