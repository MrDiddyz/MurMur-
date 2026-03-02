from __future__ import annotations

from typing import Iterable

from fastapi import HTTPException, status


def scope_matches(granted_scope: str, required_scope: str) -> bool:
    """Return True when a granted scope satisfies the required scope."""
    if granted_scope == "*":
        return True
    if granted_scope == required_scope:
        return True
    if granted_scope.endswith(":*"):
        prefix = granted_scope[:-2]
        return required_scope == prefix or required_scope.startswith(f"{prefix}:")
    return False


def has_scope(granted_scopes: Iterable[str], required_scope: str) -> bool:
    return any(scope_matches(scope, required_scope) for scope in granted_scopes)


def require_scope(granted_scopes: Iterable[str], required_scope: str) -> None:
    if has_scope(granted_scopes, required_scope):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Missing required scope: {required_scope}",
    )
