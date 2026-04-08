from fastapi import APIRouter, Depends, Header

from app.errors import InvalidAPIKeyError
from app.settings import settings

router = APIRouter()


@router.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if not x_api_key or x_api_key != settings.api_key:
        raise InvalidAPIKeyError()


@router.get("/secure/ping", dependencies=[Depends(require_api_key)])
def secure_ping() -> dict[str, str]:
    return {"message": "pong"}
