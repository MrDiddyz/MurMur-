# MurMur Local Stack

Production-like local stack for MurMur services and agents using Docker Compose.

## Services

- `web` (`:3000`) — basic UI/status surface, checks API health.
- `api` (`:3001`) — task intake and status store backed by Redis.
- `worker` (`:3010`) — consumes one queued task per execution (`/run-once`).
- `planner-agent` (`:3101`)
- `builder-agent` (`:3102`)
- `reviewer-agent` (`:3103`)
- `optimizer-agent` (`:3104`)
- `redis` (`:6379`) — queue + task state storage.

## Quick start

```bash
cp .env.example .env
make up
make ps
make check
```

## End-to-end smoke test

After the stack is healthy:

```bash
make smoke
```

This submits an execution request to `planner-agent`, which:
1. creates a task through `api` (`POST /tasks`), then
2. triggers worker processing (`POST /run-once`), and
3. returns task + processing result.

## Useful commands

```bash
make logs
make config
make down
make clean
```

## Health endpoints

- `GET /health` for all services.
- `api` health validates Redis ping.
- `worker` and agents validate upstream dependencies.
