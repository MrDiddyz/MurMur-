"""Initialize database tables for local development."""

from app.db.database import engine
from app.models.person import Base


def init_db() -> None:
    """Create tables defined by SQLAlchemy models."""
    Base.metadata.create_all(bind=engine)
