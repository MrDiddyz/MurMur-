from pydantic import BaseModel


class DNAProfile(BaseModel):
    id: str
    person_id: str
    source: str
