import json
from fastapi import APIRouter, Header, HTTPException
from psycopg.errors import CheckViolation
from .db import get_conn
from .models import CreateRunRequest, EventRequest, TransitionRequest

router = APIRouter(prefix="/v1")


def _transition(run_id: str, to_state: str, event_type: str, actor: str = "system", payload: dict | None = None):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT row_to_json(transition_run_state(%s, %s::run_state, %s, %s, %s::jsonb)) AS run",
                (run_id, to_state, event_type, actor, json.dumps(payload or {})),
            )
            row = cur.fetchone()
            return row["run"] if row else None


@router.post("/runs")
def create_run(req: CreateRunRequest, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")):
    with get_conn() as conn:
        with conn.cursor() as cur:
            if idempotency_key:
                cur.execute(
                    "SELECT row_to_json(runs) AS run FROM runs WHERE user_id=%s::uuid AND idempotency_key=%s LIMIT 1",
                    (req.user_id, idempotency_key),
                )
                existing = cur.fetchone()
                if existing and existing["run"]:
                    return existing["run"]

            cur.execute(
                """
                SELECT row_to_json(create_run(%s::uuid,%s::uuid,%s::uuid,%s,%s,%s::jsonb,%s)) AS run
                """,
                (
                    req.user_id,
                    req.org_id,
                    req.project_id,
                    req.request_text,
                    req.request_locale,
                    json.dumps(req.request_json or {}),
                    idempotency_key,
                ),
            )
            row = cur.fetchone()
            return row["run"]


@router.get("/runs/{run_id}")
def get_run(run_id: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT row_to_json(runs) AS run FROM runs WHERE run_id = %s::uuid", (run_id,))
            row = cur.fetchone()
            if not row or not row["run"]:
                raise HTTPException(status_code=404, detail="Run not found")
            return row["run"]


@router.post("/runs/{run_id}/approve")
def approve_run(run_id: str, req: TransitionRequest):
    try:
        return _transition(run_id, "APPROVED", "run.approved", req.actor or "system", req.payload)
    except CheckViolation as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


@router.post("/runs/{run_id}/deny")
def deny_run(run_id: str, req: TransitionRequest):
    try:
        return _transition(run_id, "CANCELLED", "run.denied", req.actor or "system", req.payload)
    except CheckViolation as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


@router.post("/events")
def post_event(req: EventRequest):
    try:
        return _transition(req.run_id, req.to_state, req.event_type, req.actor or "system", req.payload)
    except CheckViolation as e:
        raise HTTPException(status_code=409, detail=str(e)) from e
