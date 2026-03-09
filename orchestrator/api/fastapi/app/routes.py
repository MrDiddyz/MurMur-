from uuid import UUID

from fastapi import APIRouter, Header, HTTPException
from psycopg.errors import CheckViolation, NoDataFound, UniqueViolation
from psycopg.types.json import Json

from .db import get_conn
from .models import CreateEventRequest, CreateRunRequest, DecisionRequest

router = APIRouter(prefix="/v1")


def _db_error_to_http(exc: Exception) -> HTTPException:
    if isinstance(exc, NoDataFound):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, CheckViolation):
        return HTTPException(status_code=400, detail=str(exc))
    return HTTPException(status_code=500, detail="Unexpected database error")


@router.post("/runs", status_code=201)
def create_run(req: CreateRunRequest, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")):
    with get_conn() as conn, conn.cursor() as cur:
        if idempotency_key:
            cur.execute(
                "SELECT * FROM runs WHERE user_id = %s AND idempotency_key = %s",
                (str(req.user_id), idempotency_key),
            )
            existing = cur.fetchone()
            if existing:
                return existing
        try:
            cur.execute(
                """
                SELECT * FROM create_run(%s, %s, %s, %s, %s, %s::jsonb, %s)
                """,
                (
                    str(req.user_id),
                    str(req.org_id) if req.org_id else None,
                    str(req.project_id) if req.project_id else None,
                    req.request_text,
                    req.request_locale,
                    Json(req.request_json),
                    idempotency_key,
                ),
            )
            return cur.fetchone()
        except UniqueViolation:
            conn.rollback()
            cur.execute(
                "SELECT * FROM runs WHERE user_id = %s AND idempotency_key = %s",
                (str(req.user_id), idempotency_key),
            )
            existing = cur.fetchone()
            if existing:
                return existing
            raise


@router.get("/runs/{run_id}")
def get_run(run_id: UUID):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM runs WHERE run_id = %s", (str(run_id),))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Run not found")
        return row


@router.post("/runs/{run_id}/approve")
def approve_run(run_id: UUID, req: DecisionRequest):
    with get_conn() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """
                INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
                VALUES (%s, 'APPROVED', %s, now(), %s)
                """,
                (str(run_id), str(req.reviewer_id) if req.reviewer_id else None, req.reason),
            )
            cur.execute(
                "SELECT * FROM transition_run_state(%s, 'APPROVED', 'run.approved', 'system', %s::jsonb)",
                (str(run_id), Json({"reason": req.reason})),
            )
            return cur.fetchone()
        except (CheckViolation, NoDataFound) as exc:
            raise _db_error_to_http(exc) from exc


@router.post("/runs/{run_id}/deny")
def deny_run(run_id: UUID, req: DecisionRequest):
    with get_conn() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """
                INSERT INTO approvals (run_id, status, reviewer_id, decided_at, reason)
                VALUES (%s, 'DENIED', %s, now(), %s)
                """,
                (str(run_id), str(req.reviewer_id) if req.reviewer_id else None, req.reason),
            )
            cur.execute(
                "SELECT * FROM transition_run_state(%s, 'CANCELLED', 'run.denied', 'system', %s::jsonb)",
                (str(run_id), Json({"reason": req.reason})),
            )
            return cur.fetchone()
        except (CheckViolation, NoDataFound) as exc:
            raise _db_error_to_http(exc) from exc


@router.post("/events", status_code=201)
def create_event(req: CreateEventRequest):
    with get_conn() as conn, conn.cursor() as cur:
        if req.to_state:
            if not req.run_id:
                raise HTTPException(status_code=400, detail="run_id is required when to_state is provided")
            try:
                cur.execute(
                    "SELECT * FROM transition_run_state(%s, %s::run_state, %s, %s, %s::jsonb)",
                    (
                        str(req.run_id),
                        req.to_state,
                        req.type,
                        req.actor,
                        Json(req.payload),
                    ),
                )
                return cur.fetchone()
            except (CheckViolation, NoDataFound) as exc:
                raise _db_error_to_http(exc) from exc

        cur.execute(
            """
            INSERT INTO run_events (run_id, type, actor, payload, source, source_event_id)
            VALUES (%s, %s, %s, %s::jsonb, %s, %s)
            RETURNING *
            """,
            (
                str(req.run_id) if req.run_id else None,
                req.type,
                req.actor,
                Json(req.payload),
                req.source,
                req.source_event_id,
            ),
        )
        return cur.fetchone()
