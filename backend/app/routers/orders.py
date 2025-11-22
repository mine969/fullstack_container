from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, auth
from ..schemas import order as schemas
from pydantic import BaseModel

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user_optional) # Optional Auth
):
    customer_id = current_user.id if current_user else None
    
    # Validate guest details if no user
    if not customer_id and not (order.guest_name and order.guest_phone):
        raise HTTPException(status_code=400, detail="Guest name and phone required for guest orders")

    # Simplified order creation logic
    db_order = models.Order(
        status="pending", 
        delivery_address=order.delivery_address,
        notes=order.notes,
        total_amount=0, # Calculate based on items
        customer_id=customer_id,
        guest_name=order.guest_name,
        guest_email=order.guest_email,
        guest_phone=order.guest_phone
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[schemas.OrderResponse])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Filter based on role (manager sees all, driver sees assigned, customer sees own)
    if current_user.role == "manager":
        return db.query(models.Order).offset(skip).limit(limit).all()
    elif current_user.role == "driver":
        return db.query(models.Order).join(models.DriverAssignment).filter(
            models.DriverAssignment.driver_id == current_user.id,
            models.DriverAssignment.status == "active" # Assuming 'active' assignment
        ).all() 
    else:
        return db.query(models.Order).filter(models.Order.customer_id == current_user.id).all()

class OrderStatusUpdate(BaseModel):
    status: str

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Allow manager and driver (and maybe admin) to update status
    if current_user.role not in ["manager", "driver", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
