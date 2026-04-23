from __future__ import annotations

import os
import tempfile

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from murmur_core.runtime.orchestrator import Orchestrator
from murmur_core.runtime.relay import ws_to_osc_message
from murmur_core.runtime.security import SecurityError, verify_message
from murmur_core.runtime.snapshots import SnapshotEngine
from murmur_core.runtime.store import Store

app = FastAPI(title="MurMur Core", version="0.1.0")

store = Store.from_env()
orch = Orchestrator(store=store)
snapshot_engine = SnapshotEngine(
    os.getenv("MURMUR_SNAPSHOT_DIR", os.path.join(tempfile.gettempdir(), "murmur-snapshots"))
)


class GoalIn(BaseModel):
    goal: str = Field(..., min_length=3, max_length=4000)


class RunOut(BaseModel):
    run_id: str
    status: str
    summary: str
    events: list[dict]


class RelayIn(BaseModel):
    channel: str = "show"
    cue: str = "hello"


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/run", response_model=RunOut)
def run_goal(payload: GoalIn, x_nonce: str = Header(...), x_ts: int = Header(...), x_sig: str = Header(...)):
    try:
        verify_message(payload.goal, nonce=x_nonce, ts=x_ts, signature=x_sig)
    except SecurityError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    if not store.mark_nonce_used(x_nonce, x_ts):
        raise HTTPException(status_code=409, detail="replay-detected")

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


@app.get("/runs/{run_id}/critical-path")
def critical_path(run_id: str):
    spans = store.spans_for_run(run_id)
    spans = sorted(spans, key=lambda s: s.get("latency_ms") or 0, reverse=True)
    total = round(sum((s.get("latency_ms") or 0) for s in spans), 3)
    return {"run_id": run_id, "total_latency_ms": total, "critical_path": spans[:5]}


@app.post("/runs/{run_id}/snapshot")
def save_snapshot(run_id: str):
    run = store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="not_found")
    return snapshot_engine.save(run_id=run_id, payload=run.model_dump())


@app.get("/runs/{run_id}/snapshot")
def recall_snapshot(run_id: str):
    try:
        return snapshot_engine.recall(run_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="not_found") from exc


@app.post("/hello-show")
def hello_show(payload: RelayIn):
    return {"osc": ws_to_osc_message(payload.model_dump())}
