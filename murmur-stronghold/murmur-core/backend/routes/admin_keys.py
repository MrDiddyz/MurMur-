from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from psycopg2.extensions import connection as PgConnection

from backend.auth.deps import require_admin_jwt
from backend.auth.security import generate_api_key, hash_api_key
from backend.db import get_connection

router = APIRouter(prefix="/admin/api-keys", tags=["admin-api-keys"])


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    scopes: list[str] = Field(default_factory=list)


@router.post("")
def create_api_key(
    payload: ApiKeyCreateRequest,
    _admin=Depends(require_admin_jwt),
    db: PgConnection = Depends(get_connection),
):
    prefix, raw_key = generate_api_key()
    key_hash = hash_api_key(raw_key)

    with db.cursor() as cur:
        cur.execute(
            """
            INSERT INTO api_keys(name, key_hash, prefix, scopes, is_active)
            VALUES (%s, %s, %s, %s, TRUE)
            RETURNING id
            """,
            (payload.name, key_hash, prefix, payload.scopes),
        )
        key_id = cur.fetchone()[0]
        db.commit()

    return {
        "id": key_id,
        "name": payload.name,
        "prefix": prefix,
        "scopes": payload.scopes,
        "api_key": raw_key,
    }


@router.post("/{key_id}/revoke")
def revoke_api_key(
    key_id: int,
    _admin=Depends(require_admin_jwt),
    db: PgConnection = Depends(get_connection),
):
    with db.cursor() as cur:
        cur.execute(
            "UPDATE api_keys SET is_active = FALSE WHERE id = %s RETURNING id",
            (key_id,),
        )
        row = cur.fetchone()
        db.commit()

    if not row:
        raise HTTPException(status_code=404, detail="api key not found")

    return {"id": key_id, "revoked": True}
