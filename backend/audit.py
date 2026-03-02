from __future__ import annotations

from typing import Any


async def log_audit_event(
    *,
    db,
    actor_type: str,
    actor_id: str | None,
    action: str,
    path: str,
    method: str,
    ip: str | None,
    status_code: int,
    meta: dict[str, Any] | None = None,
) -> None:
    await db.execute(
        """
        INSERT INTO audit_log (
            actor_type,
            actor_id,
            action,
            path,
            method,
            ip,
            status_code,
            meta
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        """,
        actor_type,
        actor_id,
        action,
        path,
        method,
        ip,
        status_code,
        meta or {},
    )
