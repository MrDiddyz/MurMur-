import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_admin_jwt(*, admin_id: int, email: str) -> str:
    secret = os.getenv("JWT_SECRET")
    issuer = os.getenv("JWT_ISSUER", "murmur-core")
    expires_min = int(os.getenv("JWT_EXPIRES_MIN", "60"))
    if not secret:
        raise RuntimeError("JWT_SECRET not configured")

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(admin_id),
        "email": email,
        "iss": issuer,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_min)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def verify_admin_jwt(token: str) -> dict:
    secret = os.getenv("JWT_SECRET")
    issuer = os.getenv("JWT_ISSUER", "murmur-core")
    if not secret:
        raise RuntimeError("JWT_SECRET not configured")

    try:
        return jwt.decode(token, secret, algorithms=[JWT_ALGORITHM], issuer=issuer)
    except JWTError as exc:
        raise ValueError("invalid token") from exc


def generate_api_key() -> tuple[str, str]:
    prefix = f"mk_{secrets.token_hex(4)}"
    secret = secrets.token_urlsafe(24)
    return prefix, f"{prefix}.{secret}"


def hash_api_key(raw_key: str) -> str:
    pepper = os.getenv("API_KEY_PEPPER")
    if not pepper:
        raise RuntimeError("API_KEY_PEPPER not configured")
    digest = hmac.new(pepper.encode("utf-8"), raw_key.encode("utf-8"), hashlib.sha256).hexdigest()
    return digest
