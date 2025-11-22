from app.database import SessionLocal, engine, Base
from app import models, auth
from sqlalchemy import text

def reset_and_seed():
    db = SessionLocal()
    try:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        
        # 1. Seed Admin
        print("Creating admin user...")
        hashed_password = auth.get_password_hash("admin123")
        admin_user = models.User(
            email="admin@example.com",
            name="Admin User",
            role="admin",
            hashed_password=hashed_password
        )
        db.add(admin_user)
        
        # 2. Seed Driver
        print("Creating driver user...")
        hashed_password = auth.get_password_hash("driver123")
        driver_user = models.User(
            email="driver@example.com",
            name="Driver One",
            role="driver",
            hashed_password=hashed_password
        )
        db.add(driver_user)

        # 3. Seed Kitchen Staff
        print("Creating kitchen user...")
        hashed_password = auth.get_password_hash("kitchen123")
        kitchen_user = models.User(
            email="kitchen@example.com",
            name="Kitchen Staff",
            role="manager", 
            hashed_password=hashed_password
        )
        db.add(kitchen_user)

        # 4. Seed Menu Items
        print("Seeding menu items...")
        items = [
            models.MenuItem(name="Burger", description="Juicy beef burger", price=12.99, image_url="burger.jpg", is_available=True, category="Main"),
            models.MenuItem(name="Pizza", description="Cheese pizza", price=15.99, image_url="pizza.jpg", is_available=True, category="Main"),
            models.MenuItem(name="Salad", description="Fresh garden salad", price=8.99, image_url="salad.jpg", is_available=True, category="Side"),
            models.MenuItem(name="Sushi", description="Salmon roll", price=18.99, image_url="sushi.jpg", is_available=True, category="Main"),
        ]
        db.add_all(items)
        
        db.commit()
        print("Reset and Seeding complete!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed()
