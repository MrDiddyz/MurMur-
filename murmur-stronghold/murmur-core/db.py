import os
from typing import Any

import asyncpg
from fastapi import HTTPException

_pool: asyncpg.Pool | None = None


async def init_db() -> None:
    global _pool
    if _pool is not None:
        return

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(status_code=500, detail="DATABASE_URL not configured")

    _pool = await asyncpg.create_pool(dsn=database_url)


async def close_db() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def _get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise HTTPException(status_code=503, detail="database unavailable")
    return _pool


async def fetch_one(query: str, *args: Any) -> asyncpg.Record | None:
    return await _get_pool().fetchrow(query, *args)


async def fetch_all(query: str, *args: Any) -> list[asyncpg.Record]:
    return await _get_pool().fetch(query, *args)


async def fetch_val(query: str, *args: Any) -> Any:
    return await _get_pool().fetchval(query, *args)


async def execute(query: str, *args: Any) -> str:
    return await _get_pool().execute(query, *args)
