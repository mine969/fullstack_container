from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_type: str
    timestamp: datetime

    class Config:
        from_attributes = True
