from __future__ import annotations

from typing import Iterable

from fastapi import HTTPException, status


GLOBAL_WILDCARD = "*"
NAMESPACE_WILDCARD_SUFFIX = ":*"


def _wildcard_prefix(scope: str) -> str | None:
    if not scope.endswith(NAMESPACE_WILDCARD_SUFFIX):
        return None
    return scope[: -len(NAMESPACE_WILDCARD_SUFFIX)]


def scope_matches(granted_scope: str, required_scope: str) -> bool:
    """Return True when a granted scope satisfies the required scope."""
    if granted_scope in {GLOBAL_WILDCARD, required_scope}:
        return True

    prefix = _wildcard_prefix(granted_scope)
    if prefix is None:
        return False

    return required_scope == prefix or required_scope.startswith(f"{prefix}:")


def has_scope(granted_scopes: Iterable[str], required_scope: str) -> bool:
    for scope in granted_scopes:
        if scope_matches(scope, required_scope):
            return True
    return False


def require_scope(granted_scopes: Iterable[str], required_scope: str) -> None:
    if has_scope(granted_scopes, required_scope):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Missing required scope: {required_scope}",
    )
