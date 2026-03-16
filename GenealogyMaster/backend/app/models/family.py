from pydantic import BaseModel


class Family(BaseModel):
    id: str
    surname: str
    origin_place: str | None = None
