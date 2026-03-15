"""Endpoints for person resources."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import get_db
from fastapi import APIRouter

from app.models.person import Person

router = APIRouter()


@router.get("/search")
def search_persons(
    navn: str | None = Query(default=None, description="Filtrer på fornavn eller etternavn"),
    fødselsår: int | None = Query(default=None, description="Filtrer på fødselsår"),
    sted: str | None = Query(default=None, description="Filtrer på sted"),
    db: Session = Depends(get_db),
) -> dict[str, list[dict[str, Any]]]:
    """Search for persons by name, birth year and place.

    The endpoint dynamically builds SQL filters only for query params that are provided.
    """

    try:
        # Start with a simple SELECT query against the persons table.
        query = select(Person)

        # Name search: partial match against first_name OR last_name (case-insensitive).
        if navn:
            wildcard = f"%{navn}%"
            query = query.where(
                (Person.first_name.ilike(wildcard)) | (Person.last_name.ilike(wildcard))
            )

        # Birth year search: exact match.
        if fødselsår is not None:
            query = query.where(Person.birth_year == fødselsår)

        # Place search: partial match (case-insensitive).
        if sted:
            query = query.where(Person.place.ilike(f"%{sted}%"))

        # Execute query and map ORM rows to JSON-safe dictionaries.
        persons = db.execute(query).scalars().all()

        results = [
            {
                "id": person.id,
                "first_name": person.first_name,
                "last_name": person.last_name,
                "birth_year": person.birth_year,
                "place": person.place,
            }
            for person in persons
        ]

        return {"results": results}

    except SQLAlchemyError as exc:
        # Basic DB error handling to avoid leaking internal DB details to clients.
        raise HTTPException(
            status_code=500,
            detail="Kunne ikke hente personer fra databasen.",
        ) from exc
@router.get("/", response_model=list[Person])
def list_persons() -> list[Person]:
    return []
