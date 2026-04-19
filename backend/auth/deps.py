from __future__ import annotations

import hmac
import os

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

_API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

_CONFIGURED_KEY = os.getenv("API_SECRET_KEY")


async def require_api_key(api_key: str | None = Security(_API_KEY_HEADER)) -> str:
    """Validate the X-API-Key header against the API_SECRET_KEY env variable.

    Uses hmac.compare_digest to prevent timing-based key enumeration.
    Raises 503 if the env var is missing so misconfiguration is visible immediately.
    """
    if not _CONFIGURED_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API key authentication is not configured (API_SECRET_KEY env var missing)",
        )
    if not api_key or not hmac.compare_digest(api_key, _CONFIGURED_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return api_key
