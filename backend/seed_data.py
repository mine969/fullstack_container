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
            # Mains
            models.MenuItem(name="Classic Burger", description="Juicy beef patty with lettuce, tomato, and cheese", price=12.99, image_url="burger.jpg", is_available=True, category="Main"),
            models.MenuItem(name="Cheese Pizza", description="Traditional tomato sauce with mozzarella", price=14.99, image_url="pizza.jpg", is_available=True, category="Main"),
            models.MenuItem(name="Grilled Salmon", description="Fresh salmon with asparagus", price=18.99, image_url="salmon.jpg", is_available=True, category="Main"),
            models.MenuItem(name="Steak Frites", description="Ribeye steak with french fries", price=24.99, image_url="steak.jpg", is_available=True, category="Main"),
            models.MenuItem(name="Chicken Alfredo", description="Creamy pasta with grilled chicken", price=16.99, image_url="pasta.jpg", is_available=True, category="Main"),
            
            # Sides
            models.MenuItem(name="Caesar Salad", description="Romaine lettuce with croutons and parmesan", price=8.99, image_url="salad.jpg", is_available=True, category="Side"),
            models.MenuItem(name="French Fries", description="Crispy golden fries", price=4.99, image_url="fries.jpg", is_available=True, category="Side"),
            models.MenuItem(name="Onion Rings", description="Battered and fried onion rings", price=5.99, image_url="onion_rings.jpg", is_available=True, category="Side"),
            
            # Drinks
            models.MenuItem(name="Cola", description="Refreshing cola drink", price=2.99, image_url="cola.jpg", is_available=True, category="Drink"),
            models.MenuItem(name="Lemonade", description="Freshly squeezed lemonade", price=3.99, image_url="lemonade.jpg", is_available=True, category="Drink"),
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
