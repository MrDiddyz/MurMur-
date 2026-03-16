"""Database configuration for PostgreSQL + SQLAlchemy."""

from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# PostgreSQL connection string. Can be overridden with DATABASE_URL environment variable.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/genealogy",
)

# SQLAlchemy engine used by ORM sessions.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Factory for database sessions.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Yield a database session and always close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
