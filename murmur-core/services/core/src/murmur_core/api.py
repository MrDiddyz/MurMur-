from fastapi import FastAPI
from pydantic import BaseModel, Field

from murmur_core.runtime.orchestrator import Orchestrator
from murmur_core.runtime.store import Store

app = FastAPI(title="MurMur Core", version="0.1.0")

store = Store.from_env()
orch = Orchestrator(store=store)


class GoalIn(BaseModel):
    goal: str = Field(..., min_length=3, max_length=4000)


class RunOut(BaseModel):
    run_id: str
    status: str
    summary: str
    events: list[dict]


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/run", response_model=RunOut)
def run_goal(payload: GoalIn):
    run = orch.run(goal=payload.goal)
    return {
        "run_id": run.run_id,
        "status": run.status,
        "summary": run.summary,
        "events": [e.model_dump() for e in run.events],
    }


@app.get("/runs/{run_id}")
def get_run(run_id: str):
    run = store.get_run(run_id)
    return run.model_dump() if run else {"error": "not_found"}
