# MurMur Core (v0.1)

## 1. Run locally (docker)
From `infra/`:
- `docker compose up --build`
- open `http://localhost:8080/docs`

## 2. Run goal
POST `http://localhost:8080/run`
Body:
```json
{"goal":"Lag en content-agent for MurMur som publiserer ukentlig og lærer av metrics"}
```

## 3. Test
**Kjør dette lokalt:**

```bash
cd murmur-core/infra
docker compose up --build
```

## 4. Example response (`POST /run`)
```json
{
  "run_id": "9f2b6c9a9b8a4b7f8e7a6f0f8c9d1e2f",
  "status": "done",
  "summary": "research:Finn innsikt og avklaringer -> insights, questions | builder:Skisser minimal demo/byggplan -> files, deploy | content:Lag 1 post + 1 CTA -> post | optimizer:Lag A/B hooks + metrics -> ab_tests, metrics | memory:Store run learnings -> stored, note | reflection:Reflect and improve -> reflection, event_count",
  "events": [
    {
      "event_id": "…",
      "run_id": "…",
      "ts": "…Z",
      "role": "orchestrator",
      "type": "goal_received",
      "message": "Goal received.",
      "data": {
        "goal": "Lag en content-agent som bygger og publiserer 3 posts i uka, måler CTR og forbedrer hooks"
      }
    },
    {
      "event_id": "…",
      "role": "orchestrator",
      "type": "plan_created",
      "message": "Plan created.",
      "data": {
        "steps": [
          "Finn innsikt og avklaringer",
          "Skisser minimal demo/byggplan",
          "Lag 1 post + 1 CTA",
          "Lag A/B hooks + metrics"
        ]
      }
    }
  ]
}
```

## 5. Verification log
- ✅ `sed -n '1,320p' murmur-core/README.md`
- ✅ `git commit -m "Document example /run response payload in README"`
