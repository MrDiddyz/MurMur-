import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from psycopg.errors import CheckViolation
from .routes import router

_ENV = os.getenv("ENV", "production").lower()
_EXPOSE_DOCS = _ENV in ("development", "dev", "local")

app = FastAPI(
    title="MurMur Orchestrator API",
    version="0.1.0",
    docs_url="/docs" if _EXPOSE_DOCS else None,
    redoc_url="/redoc" if _EXPOSE_DOCS else None,
    openapi_url="/openapi.json" if _EXPOSE_DOCS else None,
)
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def _validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"error": "validation_error", "details": exc.errors()})


@app.exception_handler(Exception)
async def _unhandled_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger("orchestrator").exception("Unhandled error: %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"error": "internal_error"})
