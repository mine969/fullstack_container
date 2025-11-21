from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, auth
from ..schemas import chat as schemas

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

@router.post("/{session_id}/messages", response_model=schemas.MessageResponse)
def send_message(
    session_id: int,
    message: schemas.MessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_message = models.Message(
        session_id=session_id,
        sender_type="user", # Determine based on role
        sender_id=current_user.id,
        message=message.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
