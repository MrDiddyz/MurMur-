from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from fastapi import Depends

from backend.auth.deps import require_api_key
from backend.auth.scopes import require_scope
from backend.audit import log_audit_event


async def _extract_scopes(api_key: Any) -> list[str]:
    if hasattr(api_key, "scopes"):
        return list(getattr(api_key, "scopes") or [])
    if isinstance(api_key, Mapping):
        return list(api_key.get("scopes") or [])
    return []


async def _extract_actor_id(api_key: Any) -> str | None:
    if hasattr(api_key, "id"):
        return str(getattr(api_key, "id"))
    if isinstance(api_key, Mapping) and api_key.get("id") is not None:
        return str(api_key["id"])
    return None


def require_api_key_with_scope(required_scope: str):
    async def dependency(api_key=Depends(require_api_key), request=None, db=None):
        scopes = await _extract_scopes(api_key)
        require_scope(scopes, required_scope)

        actor_id = await _extract_actor_id(api_key)
        if db is not None and request is not None:
            await log_audit_event(
                db=db,
                actor_type="api_key",
                actor_id=actor_id,
                action="api_key.use",
                path=request.url.path,
                method=request.method,
                ip=request.client.host if request.client else None,
                status_code=200,
                meta={"required_scope": required_scope},
            )
        return api_key

    return dependency
