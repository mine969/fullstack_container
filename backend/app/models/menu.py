from sqlalchemy import Column, Integer, String, DECIMAL, Boolean, Text
from ..database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    image_url = Column(String(255))
    category = Column(String(50))
    is_available = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
