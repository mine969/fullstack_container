from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    delivery_address: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    status: str
    total_amount: Decimal
    created_at: datetime
    delivery_address: str
    customer_id: int

    class Config:
        from_attributes = True
