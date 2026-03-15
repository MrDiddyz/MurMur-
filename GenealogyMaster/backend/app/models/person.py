"""Person ORM and response models."""

from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for SQLAlchemy declarative models."""


class Person(Base):
    """Database table for people in the genealogy database."""

    __tablename__ = "persons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    birth_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    place: Mapped[str | None] = mapped_column(String(255), nullable=True)
from pydantic import BaseModel


class Person(BaseModel):
    id: str
    first_name: str
    last_name: str
    birth_year: int | None = None
