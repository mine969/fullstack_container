from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime # Added for datetime.utcnow
from ..database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(36), unique=True, index=True, nullable=True) # Added
    status = Column(String(50), nullable=False, index=True) # Modified (added index=True)
    delivery_address = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True) # Modified (added nullable=True)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow) # Modified

    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_name = Column(String(255), nullable=True)
    guest_email = Column(String(255), nullable=True)
    guest_phone = Column(String(50), nullable=True)
    
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="orders") # Modified (foreign_keys order)
    driver = relationship("User", foreign_keys=[driver_id], back_populates="deliveries") # Modified (back_populates)
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan") # Modified (added cascade)
    payment = relationship("Payment", back_populates="order", uselist=False) # Added
    driver_assignment = relationship("DriverAssignment", back_populates="order", uselist=False)
    driver_location = relationship("DriverLocation", back_populates="order", uselist=False)
    
    # Relationship to Tracking
    tracking_info = relationship("Tracking", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, nullable=False)
    item_price = Column(DECIMAL(10, 2), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")

class DriverAssignment(Base):
    __tablename__ = "driver_assignments"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    driver_id = Column(Integer, ForeignKey("users.id"))

    order = relationship("Order", back_populates="driver_assignment")
    driver = relationship("User", back_populates="driver_assignments")

class DriverLocation(Base):
    __tablename__ = "driver_locations"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    order = relationship("Order", back_populates="driver_location")
    driver = relationship("User", back_populates="driver_locations")
