from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas

router = APIRouter(
    prefix="/guest",
    tags=["guest"]
)

@router.get("/track/{tracking_input}", response_model=schemas.Order)
def track_order(
    tracking_input: str,
    db: Session = Depends(database.get_db)
):
    # 1) Try lookup by numeric Tracking ID (from Tracking Table)
    try:
        tracking_id_val = int(tracking_input)
        # Find the tracking entry
        tracking_entry = db.query(models.Tracking).filter(models.Tracking.id == tracking_id_val).first()
        
        # Return the associated order
        if tracking_entry and tracking_entry.order:
            return tracking_entry.order
            
    except ValueError:
        pass  # not numeric, move on

    # 2) Fallback: Lookup by old legacy tracking_id (string) on Order table
    # This keeps backward compatibility if needed, though strictly we use Tracking Table now.
    order = db.query(models.Order).filter(models.Order.tracking_id == tracking_input).first()
    if order:
        return order

    # 3) Not found
    raise HTTPException(status_code=404, detail="Order not found")
