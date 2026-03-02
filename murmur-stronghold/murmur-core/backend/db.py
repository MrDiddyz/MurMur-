import os

import psycopg2
from fastapi import HTTPException


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(status_code=500, detail="DATABASE_URL not configured")
    try:
        db = psycopg2.connect(database_url)
    except psycopg2.Error as exc:
        raise HTTPException(status_code=503, detail="database unavailable") from exc
    try:
        yield db
    finally:
        db.close()
