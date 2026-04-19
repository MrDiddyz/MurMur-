from __future__ import annotations

import os

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

_API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

_CONFIGURED_KEY = os.getenv("API_SECRET_KEY")


async def require_api_key(api_key: str | None = Security(_API_KEY_HEADER)) -> str:
    """Validate the X-API-Key header against the API_SECRET_KEY env variable.

    Raises 503 during startup if the env var is missing so the problem is
    immediately visible instead of silently returning 401 for every call.
    """
    if not _CONFIGURED_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API key authentication is not configured (API_SECRET_KEY env var missing)",
        )
    if not api_key or api_key != _CONFIGURED_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return api_key
