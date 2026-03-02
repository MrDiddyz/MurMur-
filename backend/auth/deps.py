from __future__ import annotations

from fastapi import HTTPException, status


async def require_api_key():
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="API key authentication is not configured",
    )
