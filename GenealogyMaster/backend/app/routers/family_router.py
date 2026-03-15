from fastapi import APIRouter

from app.models.family import Family

router = APIRouter()


@router.get("/", response_model=list[Family])
def list_families() -> list[Family]:
    return []
