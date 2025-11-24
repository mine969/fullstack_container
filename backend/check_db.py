from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Order
from app.database import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- USERS ---")
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id}, Name: {u.name}, Email: {u.email}, Role: {u.role}")

print("\n--- ORDERS ---")
orders = db.query(Order).all()
for o in orders:
    print(f"ID: {o.id}, Status: {o.status}, DriverID: {o.driver_id}, Guest: {o.guest_name}")

db.close()
