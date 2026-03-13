# MurMur v0.3

Replay-first multi-agent runtime with append-only events, deterministic MockLLM execution, async workers, and state projections.

## Quickstart
```bash
cd murmur-v03
docker compose up --build
```

## Docker Compose commands
```bash
docker compose up --build
docker compose logs -f api
docker compose logs -f worker
docker compose down -v
```

## API curl examples
```bash
curl -X POST http://localhost:8000/v1/jobs \
  -H 'Content-Type: application/json' \
  -d '{
    "task":"Design and implement a deterministic orchestration flow",
    "context":{"tenant":"demo"},
    "mode":"auto",
    "council":["architect","builder","critic","experimenter","synthesizer"],
    "allow_tools":["code.run"]
  }'

curl http://localhost:8000/v1/jobs/<job_id>
curl http://localhost:8000/v1/jobs/<job_id>/events
curl http://localhost:8000/v1/jobs/<job_id>/replay
curl http://localhost:8000/v1/jobs/<job_id>/timeline
curl http://localhost:8000/v1/health
```

## Replay explanation
`/v1/jobs/{job_id}/replay` folds ordered events only; no external calls are used during replay, guaranteeing deterministic debugging.

## Event schema explanation
Every event envelope has:
- `event_id`, `job_id`, `run_id`, `seq`
- `type`, `timestamp`, `version`
- `actor`, `payload`, `meta`

Events are append-only in `events` table.

## Deterministic debugging explanation
- MockLLM outputs are deterministic by `(role, task, context)` digest.
- Bandit arm samples are deterministic by `(run_id, arm_id, alpha, beta)` hash.
- Replay fold logic is pure and deterministic.

## Bandit explanation
- 10 Thompson-style arms persisted in `bandit_arms`.
- Arm selected in auto mode.
- Reward = 1 when score >= 0.75, else 0.
- Alpha/Beta updated after each run.

## CLI usage
```bash
python -m apps.cli.murmurs job --task "Plan launch" --context examples/replay_demo.json --mode auto
python -m apps.cli.murmurs status --job <job_id>
python -m apps.cli.murmurs events --job <job_id>
python -m apps.cli.murmurs replay --job <job_id>
python -m apps.cli.murmurs timeline --job <job_id>
python -m apps.cli.murmurs bandits --list
```

## Example end-to-end flow
1. Submit job via POST `/v1/jobs`.
2. API emits `TASK_RECEIVED`, stores queued projection, and enqueues RQ job.
3. Worker emits orchestration events through completion.
4. Projection tables update incrementally (`job_projection`, `agent_output_projection`, `snapshot_projection`).
5. Read APIs fetch fast projected state and full event timeline.
6. Replay endpoint reconstructs state from event stream as source of truth.
