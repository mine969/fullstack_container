from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Tracking(Base):
    __tablename__ = "tracking"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    status = Column(String(50))
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Order
    order = relationship("Order", back_populates="tracking_info")
