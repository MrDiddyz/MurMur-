from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr

from backend.auth.rate_limit import is_rate_limited, record_login_attempt

router = APIRouter(prefix="/auth/admin", tags=["auth-admin"])


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


def _client_ip(request: Request) -> str:
    """Return the real client IP.

    ProxyHeadersMiddleware (configured in main.py) rewrites request.client
    based on X-Forwarded-For only for trusted proxy IPs, so reading
    request.client.host here is already safe.
    """
    return request.client.host if request.client else "unknown"


async def get_db():
    raise HTTPException(
        status_code=501,
        detail="Database adapter not implemented. Wire up a real DB dependency.",
    )


async def authenticate_admin(db, email: str, password: str):
    raise HTTPException(
        status_code=501,
        detail="authenticate_admin not implemented.",
    )


@router.post("/login")
async def admin_login(payload: AdminLoginRequest, request: Request, db=Depends(get_db)):
    client_ip = _client_ip(request)

    if await is_rate_limited(db, payload.email, client_ip):
        await record_login_attempt(db, payload.email, client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Try again later.",
        )

    admin = await authenticate_admin(db, payload.email, payload.password)
    login_ok = admin is not None
    await record_login_attempt(db, payload.email, client_ip, login_ok)

    if not login_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return {"ok": True, "admin_id": admin["id"]}
