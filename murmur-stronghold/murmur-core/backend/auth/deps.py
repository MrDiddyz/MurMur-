from typing import Any

from fastapi import Depends, Header, HTTPException
from psycopg2.extensions import connection as PgConnection

from backend.auth.security import hash_api_key, verify_admin_jwt
from backend.db import get_connection


def require_admin_jwt(authorization: str = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing auth")

    token = authorization.replace("Bearer ", "", 1).strip()
    if not token:
        raise HTTPException(status_code=401, detail="missing token")

    try:
        payload = verify_admin_jwt(token)
    except ValueError as exc:
        raise HTTPException(status_code=403, detail="invalid token") from exc
    return payload


def _extract_api_key(authorization: str | None, x_api_key: str | None) -> str | None:
    if x_api_key:
        return x_api_key.strip()
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "", 1).strip()
    return None


def require_api_key(
    db: PgConnection,
    authorization: str = Header(default=None),
    x_api_key: str = Header(default=None),
) -> dict[str, Any]:
    raw_key = _extract_api_key(authorization, x_api_key)
    if not raw_key:
        raise HTTPException(status_code=401, detail="missing api key")

    prefix = raw_key.split(".", 1)[0]
    if not prefix:
        raise HTTPException(status_code=401, detail="invalid api key")

    key_hash = hash_api_key(raw_key)
    with db.cursor() as cur:
        cur.execute(
            """
            SELECT id, name, scopes
            FROM api_keys
            WHERE prefix = %s AND key_hash = %s AND is_active = TRUE
            """,
            (prefix, key_hash),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=403, detail="invalid api key")

        cur.execute("UPDATE api_keys SET last_used_at = NOW() WHERE id = %s", (row[0],))
        db.commit()

    return {"id": row[0], "name": row[1], "scopes": row[2] or []}


def require_api_key_dep(
    authorization: str = Header(default=None),
    x_api_key: str = Header(default=None),
    db: PgConnection = Depends(get_connection),
) -> dict[str, Any]:
    return require_api_key(db=db, authorization=authorization, x_api_key=x_api_key)
