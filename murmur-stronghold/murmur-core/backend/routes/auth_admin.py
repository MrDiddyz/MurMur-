from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from psycopg2.extensions import connection as PgConnection

from backend.auth.security import create_admin_jwt, verify_password
from backend.db import get_connection

router = APIRouter(prefix="/auth/admin", tags=["admin-auth"])


class AdminLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def admin_login(payload: AdminLoginRequest, db: PgConnection = Depends(get_connection)):
    with db.cursor() as cur:
        cur.execute(
            """
            SELECT id, email, password_hash, is_active
            FROM admin_users
            WHERE email = %s
            """,
            (payload.email.lower(),),
        )
        row = cur.fetchone()

    if not row or not row[3]:
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not verify_password(payload.password, row[2]):
        raise HTTPException(status_code=401, detail="invalid credentials")

    token = create_admin_jwt(admin_id=row[0], email=row[1])
    return {"access_token": token, "token_type": "bearer"}
