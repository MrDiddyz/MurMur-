from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from backend.audit import log_audit_event

router = APIRouter(prefix="/admin/api-keys", tags=["admin-api-keys"])


async def get_db():
    raise NotImplementedError


async def get_admin_actor():
    raise NotImplementedError


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
    payload: dict,
    db=Depends(get_db),
    admin=Depends(get_admin_actor),
):
    row = await db.fetch_one(
        """
        INSERT INTO api_keys (name, scopes)
        VALUES ($1, $2)
        RETURNING id, name, scopes, is_active, created_at, last_used_at, revoked_at
        """,
        payload.get("name"),
        payload.get("scopes", []),
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
    return dict(row)


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
