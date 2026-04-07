from fastapi import APIRouter, Header, HTTPException
from psycopg.errors import CheckViolation, UniqueViolation
from psycopg.types.json import Json

from .db import get_conn
from .models import ApprovalDecisionRequest, EventTransitionRequest, RunCreateRequest

router = APIRouter(prefix="/v1")


@router.post("/runs")
def create_run(payload: RunCreateRequest, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")):
    with get_conn() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """
                SELECT to_jsonb(r) AS run
                FROM create_run(%s, %s, %s, %s, %s, %s::jsonb, %s) AS r
                """,
                (
                    str(payload.user_id),
                    str(payload.org_id) if payload.org_id else None,
                    str(payload.project_id) if payload.project_id else None,
                    payload.request_text,
                    payload.request_locale,
                    Json(payload.request_json),
                    idempotency_key,
                ),
            )
            row = cur.fetchone()
            conn.commit()
            return row["run"]
        except UniqueViolation:
            if not idempotency_key:
                raise
            conn.rollback()
            cur.execute(
                """
                SELECT to_jsonb(r) AS run
                FROM runs r
                WHERE r.user_id = %s AND r.idempotency_key = %s
                LIMIT 1
                """,
                (str(payload.user_id), idempotency_key),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=409, detail="Idempotent request conflict")
            return row["run"]


@router.get("/runs/{run_id}")
def get_run(run_id: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT to_jsonb(r) AS run FROM runs r WHERE r.run_id = %s", (run_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Run not found")
        return row["run"]


@router.post("/events")
def post_event(payload: EventTransitionRequest):
    with get_conn() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """
                SELECT to_jsonb(r) AS run
                FROM transition_run_state(%s, %s::run_state, %s, %s, %s::jsonb) AS r
                """,
                (str(payload.run_id), payload.to_state, payload.event_type, payload.actor, Json(payload.payload)),
            )
            row = cur.fetchone()
            conn.commit()
            return row["run"]
        except CheckViolation as exc:
            conn.rollback()
            raise HTTPException(status_code=422, detail=str(exc).strip())


@router.post("/runs/{run_id}/approve")
def approve_run(run_id: str, payload: ApprovalDecisionRequest):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
            VALUES (%s, 'APPROVED', %s, now(), %s)
            """,
            (run_id, str(payload.reviewer_id) if payload.reviewer_id else None, payload.reason),
        )
        try:
            cur.execute(
                """
                SELECT to_jsonb(r) AS run
                FROM transition_run_state(
                  %s,
                  'APPROVED',
                  'run.approved',
                  'system',
                  %s::jsonb
                ) AS r
                """,
                (run_id, Json({"reason": payload.reason} if payload.reason else {})),
            )
            row = cur.fetchone()
            conn.commit()
            return row["run"]
        except CheckViolation as exc:
            conn.rollback()
            raise HTTPException(status_code=422, detail=str(exc).strip())


@router.post("/runs/{run_id}/deny")
def deny_run(run_id: str, payload: ApprovalDecisionRequest):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
            VALUES (%s, 'DENIED', %s, now(), %s)
            """,
            (run_id, str(payload.reviewer_id) if payload.reviewer_id else None, payload.reason),
        )
        try:
            cur.execute(
                """
                SELECT to_jsonb(r) AS run
                FROM transition_run_state(
                  %s,
                  'FAILED',
                  'run.denied',
                  'system',
                  %s::jsonb
                ) AS r
                """,
                (run_id, Json({"reason": payload.reason} if payload.reason else {})),
            )
            row = cur.fetchone()
            conn.commit()
            return row["run"]
        except CheckViolation as exc:
            conn.rollback()
            raise HTTPException(status_code=422, detail=str(exc).strip())
