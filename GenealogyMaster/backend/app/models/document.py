from pydantic import BaseModel


class Document(BaseModel):
    id: str
    filename: str
    document_type: str
