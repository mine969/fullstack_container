import uuid
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

    # Calculate total and prepare items
    total_amount = 0
    order_items_data = []
    
    for item in order.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        
        item_total = menu_item.price * item.quantity
        total_amount += item_total
        order_items_data.append({
            "menu_item_id": item.menu_item_id,
            "quantity": item.quantity,
            "item_price": menu_item.price
        })

    db_order = models.Order(
        status="pending", 
        delivery_address=order.delivery_address,
        notes=order.notes,
        total_amount=total_amount,
        customer_id=customer_id,
        guest_name=order.guest_name,
        guest_email=order.guest_email,
        guest_phone=order.guest_phone
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create Tracking Record (Separate Table)
    db_tracking = models.Tracking(
        order_id=db_order.id,
        status="pending"
    )
    db.add(db_tracking)
    db.commit()
    db.refresh(db_tracking)
    
    # Fake/Inject the Tracking ID into the response object so the Schema picks it up
    # Schema expects 'tracking_id' (str). We give it the new Tracking Table ID.
    db_order.tracking_id = str(db_tracking.id)

    # Save order items

    # Save order items
    for item_data in order_items_data:
        db_item = models.OrderItem(
            order_id=db_order.id,
            menu_item_id=item_data["menu_item_id"],
            quantity=item_data["quantity"],
            item_price=item_data["item_price"]
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    
    # Re-inject Tracking ID (refresh wipes it out)
    db_order.tracking_id = str(db_tracking.id)
    
    return db_order

@router.get("/", response_model=List[schemas.OrderResponse])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Filter by role
    if current_user.role in ["admin", "kitchen"]:
        return db.query(models.Order).all()
    elif current_user.role == "driver":
        return db.query(models.Order).filter(models.Order.driver_id == current_user.id).all()
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
    # Allow kitchen, driver and admin to update status
    if current_user.role not in ["kitchen", "driver", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

class AssignDriverRequest(BaseModel):
    driver_id: int

@router.put("/{order_id}/assign", response_model=schemas.OrderResponse)
def assign_driver(
    order_id: int,
    assign_req: AssignDriverRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role not in ["admin", "kitchen"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    driver = db.query(models.User).filter(models.User.id == assign_req.driver_id, models.User.role == "driver").first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    order.driver_id = driver.id
    order.status = "assigned" # Auto update status
    db.commit()
    db.refresh(order)
    return order

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(database.get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
