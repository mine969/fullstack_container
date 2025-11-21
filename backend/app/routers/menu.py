from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, auth
from ..schemas import menu as schemas

router = APIRouter(
    prefix="/menu",
    tags=["menu"]
)

@router.get("/", response_model=List[schemas.MenuItemResponse])
def read_menu_items(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = db.query(models.MenuItem).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=schemas.MenuItemResponse)
def create_menu_item(
    item: schemas.MenuItemCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_manager) # Only managers
):
    db_item = models.MenuItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
