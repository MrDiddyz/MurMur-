from datetime import datetime, timezone

from events import types
from storage.models import AgentOutputProjection, JobProjection, SnapshotProjection


def _now():
    return datetime.now(timezone.utc)


def apply_projection(session, event):
    evt = event.type
    payload = event.payload_json
    job = session.get(JobProjection, event.job_id)

    if evt == types.TASK_RECEIVED:
        if not job:
            job = JobProjection(
                job_id=event.job_id,
                latest_run_id=event.run_id,
                status="queued",
                task=payload.get("task", ""),
                context_json=payload.get("context", {}),
            )
            session.add(job)
    else:
        # For non-TASK_RECEIVED events, ensure job exists (handles out-of-order events)
        if not job:
            job = JobProjection(
                job_id=event.job_id,
                latest_run_id=event.run_id,
                status="queued",
                task="",
                context_json={},
            )
            session.add(job)
        
        # Apply event-specific updates
        job.latest_run_id = event.run_id
        if evt == types.RUN_STARTED:
            job.status = "running"
        elif evt == types.COUNCIL_SELECTED:
            job.council_id = payload.get("council_id")
        elif evt == types.STRATEGY_SELECTED:
            job.strategy_id = payload.get("strategy_id")
        elif evt == types.SYNTHESIS_GENERATED:
            job.decision = payload.get("decision")
            job.next_tasks_json = payload.get("next_tasks", [])
            job.parking_lot_json = payload.get("parking_lot", [])
        elif evt == types.EVALUATION_COMPLETED:
            job.score = payload.get("score")
        elif evt == types.RUN_COMPLETED:
            job.status = "succeeded"
        elif evt == types.RUN_FAILED:
            job.status = "failed"
        job.updated_at = _now()

    if evt == types.AGENT_OUTPUT_RECORDED:
        session.add(
            AgentOutputProjection(
                job_id=event.job_id,
                run_id=event.run_id,
                agent_id=payload.get("agent_id", "unknown"),
                role=payload.get("role", "Unknown"),
                output_text=payload.get("output_text", ""),
                latency_ms=payload.get("latency_ms", 0),
            )
        )

    if evt == types.STATE_SNAPSHOT_CREATED:
        session.add(
            SnapshotProjection(
                snapshot_id=payload.get("snapshot_id"),
                job_id=event.job_id,
                run_id=event.run_id,
                state_version=payload.get("state_version", 1),
                state_json=payload,
            )
        )
