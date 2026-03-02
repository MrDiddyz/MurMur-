from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Event(BaseModel):
    model_config = ConfigDict(frozen=True)

    symbol: str = Field(min_length=1)
    bid: float = Field(gt=0)
    ask: float = Field(gt=0)
    last: float = Field(gt=0)
    volume: int = Field(ge=0)
    event_time: datetime
    arrival_time: datetime
    processing_time: datetime


class OrderDecision(BaseModel):
    action: str
    quantity: int


class Fill(BaseModel):
    side: str
    quantity: int
    price: float


class PortfolioState(BaseModel):
    cash: float
    position: int
    last_mid: float
    pnl: float
