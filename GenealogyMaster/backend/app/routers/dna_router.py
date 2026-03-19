from fastapi import APIRouter

from app.models.dna import DNAProfile

router = APIRouter()


@router.get("/", response_model=list[DNAProfile])
def list_profiles() -> list[DNAProfile]:
    return []
