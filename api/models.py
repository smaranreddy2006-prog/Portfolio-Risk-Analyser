from pydantic import BaseModel
from typing import Optional

class PortfolioItem(BaseModel):
    ticker: str
    amount: float
    avg_price: Optional[float] = None

class PortfolioRequest(BaseModel):
    items: list[PortfolioItem]
