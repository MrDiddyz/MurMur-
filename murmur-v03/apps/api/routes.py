import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from redis import Redis
from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api.deps import get_db, job_queue
from core.contracts import JobRequest
from core.ids import gen_id, utc_now
from core.replay import replay
from events.reader import events_for_latest_run
from events.schemas import EventEnvelope
from events.types import TASK_RECEIVED
from events.writer import EventWriter
from queue.jobs import process_job
from storage.models import JobProjection

router = APIRouter(prefix="/v1")


class JobCreated(BaseModel):
    job_id: str
    run_id: str
    status: str


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    redis = Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
    redis.ping()
    return {"ok": True, "db": "ok", "redis": "ok"}


@router.post("/jobs", response_model=JobCreated)
def create_job(req: JobRequest, db: Session = Depends(get_db)):
    job_id = gen_id("job")
    run_id = gen_id("run")
    writer = EventWriter(db)
    env = EventEnvelope(
        event_id=gen_id("evt"),
        job_id=job_id,
        run_id=run_id,
        seq=1,
        type=TASK_RECEIVED,
        timestamp=utc_now(),
        actor="api",
        payload={
            "task": req.task,
            "context": req.context,
            "mode": req.mode,
            "allow_tools": req.allow_tools,
        },
        meta={"strategy_id": req.strategy_id},
    )
    writer.append(env)
    db.commit()
    job_queue.enqueue(process_job, job_id, run_id, req.model_dump())
    return {"job_id": job_id, "run_id": run_id, "status": "queued"}


@router.get("/jobs/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    row = db.get(JobProjection, job_id)
    if not row:
        raise HTTPException(404, "job not found")
    return {
        "job_id": row.job_id,
        "status": row.status,
        "task": row.task,
        "strategy_id": row.strategy_id,
        "council_id": row.council_id,
        "decision": row.decision,
        "next_tasks": row.next_tasks_json,
        "parking_lot": row.parking_lot_json,
        "score": row.score,
    }


@router.get("/jobs/{job_id}/events")
def get_events(job_id: str, db: Session = Depends(get_db)):
    rows, run_id = events_for_latest_run(db, job_id)
    return {
        "job_id": job_id,
        "run_id": run_id,
        "events": [
            {
                "event_id": e.event_id,
                "job_id": e.job_id,
                "run_id": e.run_id,
                "seq": e.seq,
                "type": e.type,
                "timestamp": e.timestamp.isoformat(),
                "version": e.version,
                "actor": e.actor,
                "payload": e.payload_json,
                "meta": e.meta_json,
            }
            for e in rows
        ],
    }


@router.get("/jobs/{job_id}/replay")
def get_replay(job_id: str, db: Session = Depends(get_db)):
    rows, run_id = events_for_latest_run(db, job_id)
    if not run_id:
        raise HTTPException(404, "job not found")
    return replay(job_id, run_id, rows)


@router.get("/jobs/{job_id}/timeline")
def get_timeline(job_id: str, db: Session = Depends(get_db)):
    rows, run_id = events_for_latest_run(db, job_id)
    return {
        "job_id": job_id,
        "run_id": run_id,
        "timeline": [
            {"seq": e.seq, "type": e.type, "actor": e.actor, "timestamp": e.timestamp.isoformat()} for e in rows
        ],
    }


@router.get("/bandits")
def bandits(db: Session = Depends(get_db)):
    from storage.models import BanditArm
    return [
        {"arm_id": b.arm_id, "strategy_id": b.strategy_id, "alpha": b.alpha, "beta": b.beta}
        for b in db.query(BanditArm).all()
    ]
