from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from .menu import MenuItemResponse

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    item_price: Decimal
    menu_item: MenuItemResponse

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    delivery_address: str
    notes: Optional[str] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    status: str
    total_amount: Decimal
    created_at: datetime
    delivery_address: str
    customer_id: Optional[int] = None
    guest_name: Optional[str] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
