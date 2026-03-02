import os
from typing import Callable

import jwt
from fastapi import Depends, Header, HTTPException


def verify_token(authorization: str = Header(default=None)):
    jwt_secret = os.getenv("JWT_SECRET")
    if not jwt_secret:
        raise HTTPException(status_code=500, detail="JWT secret not configured")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing auth")

    token = authorization.replace("Bearer ", "", 1).strip()
    if not token:
        raise HTTPException(status_code=401, detail="missing token")

    try:
        return jwt.decode(token, jwt_secret, algorithms=["HS256"])
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=403, detail="invalid token") from exc


def require_api_key_with_scope(required_scope: str) -> Callable:
    def dependency(claims=Depends(verify_token)):
        token_scopes = claims.get("scopes") or claims.get("scope") or []
        if isinstance(token_scopes, str):
            token_scopes = token_scopes.split()

        if required_scope not in token_scopes:
            raise HTTPException(status_code=403, detail="insufficient scope")
        return claims

    return dependency
