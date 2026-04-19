from __future__ import annotations

import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from backend.audit import log_audit_event


def _generate_api_key() -> tuple[str, str]:
    """Return (raw_key, sha256_hex). Raw key is shown once; only hash is stored."""
    raw = secrets.token_urlsafe(32)
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return raw, digest

router = APIRouter(prefix="/admin/api-keys", tags=["admin-api-keys"])


class CreateApiKeyRequest(BaseModel):
    name: str
    scopes: list[str] = Field(default_factory=list)


async def get_db():
    raise HTTPException(
        status_code=501,
        detail="Database adapter not implemented. Wire up a real DB dependency.",
    )


async def get_admin_actor():
    raise HTTPException(
        status_code=501,
        detail="Admin actor dependency not implemented.",
    )


@router.get("")
async def list_api_keys(request: Request, db=Depends(get_db), admin=Depends(get_admin_actor)):
    rows = await db.fetch_all(
        """
        SELECT id, name, scopes, is_active, created_at, last_used_at, revoked_at
        FROM api_keys
        ORDER BY created_at DESC
        """
    )
    return [dict(row) for row in rows]


@router.post("")
async def create_api_key(
    request: Request,
    payload: CreateApiKeyRequest,
    db=Depends(get_db),
    admin=Depends(get_admin_actor),
):
    raw_key, key_hash = _generate_api_key()
    row = await db.fetch_one(
        """
        INSERT INTO api_keys (name, key_hash, scopes)
        VALUES ($1, $2, $3)
        RETURNING id, name, scopes, is_active, created_at, last_used_at, revoked_at
        """,
        payload.name,
        key_hash,
        payload.scopes,
    )
    await log_audit_event(
        db=db,
        actor_type="admin",
        actor_id=str(admin["id"]),
        action="api_key.create",
        path=request.url.path,
        method=request.method,
        ip=request.client.host if request.client else None,
        status_code=201,
        meta={"api_key_id": str(row["id"]), "name": row["name"]},
    )
    result = dict(row)
    result["key"] = raw_key  # shown once — not stored
    return result


@router.post("/{key_id}/revoke")
async def revoke_api_key(
    key_id: str,
    request: Request,
    db=Depends(get_db),
    admin=Depends(get_admin_actor),
):
    await db.execute(
        """
        UPDATE api_keys
        SET is_active = FALSE,
            revoked_at = NOW()
        WHERE id = $1
        """,
        key_id,
    )
    await log_audit_event(
        db=db,
        actor_type="admin",
        actor_id=str(admin["id"]),
        action="api_key.revoke",
        path=request.url.path,
        method=request.method,
        ip=request.client.host if request.client else None,
        status_code=200,
        meta={"api_key_id": key_id},
    )
    return {"ok": True}
