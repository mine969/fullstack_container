from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas

router = APIRouter(
    prefix="/guest",
    tags=["guest"]
)

@router.get("/track/{tracking_id}", response_model=schemas.Order)
def track_order(
    tracking_id: str,
    db: Session = Depends(database.get_db)
):
    # Try to find by ID if tracking_id is numeric
    if tracking_id.isdigit():
        order = db.query(models.Order).filter(models.Order.id == int(tracking_id)).first()
        if order:
            return order

    # Fallback to tracking_id column
    order = db.query(models.Order).filter(models.Order.tracking_id == tracking_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
