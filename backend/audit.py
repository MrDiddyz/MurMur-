from __future__ import annotations

import logging
from typing import Any

_logger = logging.getLogger("backend.audit")


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
    try:
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
    except Exception:
        _logger.exception(
            "Failed to write audit log: action=%s actor=%s/%s path=%s",
            action, actor_type, actor_id, path,
        )
