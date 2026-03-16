from fastapi import APIRouter

from app.models.document import Document

router = APIRouter()


@router.get("/", response_model=list[Document])
def list_documents() -> list[Document]:
    return []
