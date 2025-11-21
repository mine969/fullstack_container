from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # manager, kitchen, driver, customer
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="user", uselist=False)
    driver_assignments = relationship("DriverAssignment", back_populates="driver")
    driver_locations = relationship("DriverLocation", back_populates="driver")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    session_token = Column(String(255))
    name = Column(String(255))
    phone = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
