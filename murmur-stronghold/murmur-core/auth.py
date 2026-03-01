import os

import jwt
from fastapi import Header, HTTPException


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
        jwt.decode(token, jwt_secret, algorithms=["HS256"])
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=403, detail="invalid token") from exc
