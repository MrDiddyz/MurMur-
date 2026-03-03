from __future__ import annotations

import logging
import time
import uuid

from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.routes.admin_keys import router as admin_keys_router
from backend.routes.auth_admin import router as auth_admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.api")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach request metadata and emit a simple access log."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        request.state.request_id = request_id

        started = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - started) * 1000, 2)

        response.headers["x-request-id"] = request_id
        response.headers["x-response-time-ms"] = str(duration_ms)

        logger.info(
            "%s %s -> %s (%sms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


def _error_payload(request: Request, code: str, message: str) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "request_id": getattr(request.state, "request_id", None),
        }
    }


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_payload(request, "http_error", detail),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            **_error_payload(request, "validation_error", "Request validation failed"),
            "details": exc.errors(),
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error while serving %s", request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_payload(request, "internal_error", "Internal server error"),
    )


def create_app() -> FastAPI:
    app = FastAPI(
        title="MurMur Boilerplate API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    api_router = APIRouter(prefix="/api/v1")

    @api_router.get("/health", tags=["health"])
    async def health() -> dict[str, bool]:
        return {"ok": True}

    @api_router.get("/ready", tags=["health"])
    async def ready() -> dict[str, str]:
        return {"status": "ready"}

    api_router.include_router(auth_admin_router)
    api_router.include_router(admin_keys_router)

    app.include_router(api_router)
    app.add_middleware(RequestContextMiddleware)

    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    return app


app = create_app()
