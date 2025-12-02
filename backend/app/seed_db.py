import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, SQLALCHEMY_DATABASE_URL
from app.models.user import User
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem, DriverAssignment, DriverLocation
from app.models.payment import Payment

# Setup DB connection
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if users exist
        if db.query(User).first():
            print("Database already seeded.")
            return

        print("Seeding Users...")
        users = [
            User(id=1, name='John Wick', email='johnwick123@gmail.com', hashed_password=get_password_hash('password'), role='admin'),
            User(id=13, name='admin', email='admin123@gmail.com', hashed_password=get_password_hash('password'), role='admin'),
            User(id=14, name='Gordon Ramsay', email='gordonramsay123@gmail.com', hashed_password=get_password_hash('password'), role='kitchen'),
            User(id=15, name='Michael Schumacher', email='michael123@gmail.com', hashed_password=get_password_hash('password'), role='driver')
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Menu Items...")
        menu_items = [
            MenuItem(id=1, name='Classic Burger', description='Juicy beef patty with lettuce, tomato, and cheese', price=12.99, image_url='/static/images/burger.jpg', is_available=True, category='Main', is_deleted=False),
            MenuItem(id=2, name='Cheese Pizza', description='Traditional tomato sauce with mozzarella', price=14.99, image_url='/static/images/pizza.jpg', is_available=True, category='Main', is_deleted=False),
            MenuItem(id=3, name='Grilled Salmon', description='Fresh salmon with asparagus', price=18.99, image_url='/static/images/salmon.jpg', is_available=True, category='Main', is_deleted=False),
            MenuItem(id=4, name='Steak Frites', description='Ribeye steak with french fries', price=24.99, image_url='/static/images/steak.jpg', is_available=True, category='Main', is_deleted=False),
            MenuItem(id=5, name='Chicken Alfredo', description='Creamy pasta with grilled chicken', price=19.99, image_url='/static/images/2310d455-fb69-4b21-bfac-602bc200eee5.jpg', is_available=True, category='Dish', is_deleted=False),
            MenuItem(id=6, name='Caesar Salad', description='Romaine lettuce with croutons and parmesan', price=9.99, image_url='/static/images/e05989f7-6bee-4b26-94a0-93a1c4153860.jpg', is_available=True, category='Side', is_deleted=False),
            MenuItem(id=8, name='Onion Rings', description='Battered and fried onion rings', price=5.99, image_url='/static/images/6ea47aea-fbd2-4ff0-ac86-3b38622e4b39.jpg', is_available=True, category='Side', is_deleted=False),
            MenuItem(id=9, name='Cola', description='Refreshing cola drink', price=2.99, image_url='/static/images/932b18fe-c444-42d1-8b1f-346df515d5b9.png', is_available=True, category='Drink', is_deleted=False),
            MenuItem(id=10, name='Lemonade', description='Freshly squeezed lemonade', price=3.99, image_url='/static/images/376f92f8-0843-43d3-9674-208959da00f7.jpg', is_available=True, category='Drink', is_deleted=False),
            MenuItem(id=26, name='Pepesi', description='Drink ', price=2.99, image_url='/static/images/99722cfc-051f-4386-a64a-e0c2cad769a4.jpg', is_available=True, category='Drink', is_deleted=False),
            MenuItem(id=30, name='Classic Beef Burger', description='This hamburger patty recipe uses ground beef and an easy bread crumb mixture. Nothing beats a simple hamburger on a warm summer evening! Enjoy on ciabatta, Kaiser, or potato rolls topped with your favourite condiments.', price=19.99, image_url='/static/images/28c3c116-4e45-41fe-93fe-a1f6dcbdd480.jpg', is_available=True, category='Burger', is_deleted=False),
            MenuItem(id=31, name='Double Beef Burger', description='Curious about what is in a Daily Double? It is made with two 100 percent beef patties, seasoned to perfection, and melty American cheese topped off with shredded lettuce, slivered onions, mayo and two juicy slices of tomato.', price=29.99, image_url='/static/images/f330e185-df5d-4776-8f67-d9c5d042de45.jpg', is_available=True, category='Burger', is_deleted=False),
            MenuItem(id=32, name='Crispy Chicken Burger', description='Marinade strips of chicken thighs in soy sauce, garlic and ginger, then coat in cornflour and fry for these quick and easy burgers', price=19.99, image_url='/static/images/2f061631-649c-4e27-a430-880a1bba190f.jpg', is_available=True, category='Burger', is_deleted=False),
            MenuItem(id=33, name='Grilled chicken burger', description='Try these grilled chicken burgers for a nice break from typical beef hamburgers. They are fairly simple to make, full of flavor, and quite delicious.', price=19.99, image_url='/static/images/0cf1ef17-36c2-4d41-ad7f-a622cfbfc00f.jpg', is_available=True, category='Burger', is_deleted=False),
            MenuItem(id=34, name='Cheese Lover Burger', description='A breaded crispy 100 percent chicken fillet patty, a slice of melty Cheddar cheese, crispy onion rings, freshly sliced onions and fresh lettuce, topped with Nacho Cheese sauce on a cheesy bun.', price=29.99, image_url='/static/images/b0ab2615-fb4c-46f4-a197-e3405e66d0b8.jpg', is_available=True, category='Burger', is_deleted=False),
            MenuItem(id=35, name='BBQ Bacon Burger', description='A juicy, barbecue sauce-glazed burger with crisp grilled bacon, grilled onions, and cheddar cheese.', price=29.99, image_url='/static/images/0de80647-3e3e-4d49-bec9-3cdc0f1abf7f.jpg', is_available=True, category='Burger', is_deleted=False),
            MenuItem(id=36, name='Chicken Tetrazzini', description='Chicken tetrazzini is a big, bubbly pasta bake made with a creamy cheese sauce, juicy chicken and buttery garlic mushrooms.', price=19.99, image_url='/static/images/8bcb64c6-17d5-43d2-a0d0-5c6039a3e0fd.jpg', is_available=True, category='Dish', is_deleted=False),
            MenuItem(id=37, name='Chicken Florentine Pasta', description='Instant Pot Chicken Florentine Recipe is a great dinner idea with tons of cheese, spinach and tender chicken. Lots of pasta blend together for the best comfort food and the entire meal is ready in minutes', price=19.99, image_url='/static/images/0ddd9ee8-3706-40eb-97c7-dfe55dd2a7ab.jpg', is_available=True, category='Dish', is_deleted=False),
            MenuItem(id=38, name='Tuscan Chicken Pasta', description='Tuscan Chicken Pasta is rigatoni pasta tossed in cream sauce with spinach, cheese, and tomatoes and topped with baked seasoned chicken. If this sounds good to you, be sure to try my Tuscan Chicken, Creamy Tuscan Salmon and Tuscan Stuffed Shells.', price=19.99, image_url='/static/images/c041b5b0-a83d-482a-a65e-3b22cff09112.jpg', is_available=True, category='Dish', is_deleted=False),
            MenuItem(id=39, name='7 UP', description='7 Up is a product of a lemon-lime flavoured soft drink', price=2.99, image_url='/static/images/230795e2-15a0-45b9-b3d5-af37e0874955.jpg', is_available=True, category='Drink', is_deleted=False),
            MenuItem(id=40, name='French Fries', description='French Fries are arguably the perfect snack or side dish when you are craving something crisp, salty, savoury, and satisfying.', price=9.99, image_url='/static/images/4f02ab92-09fa-4543-ae7a-dd9a3b5e1995.jpg', is_available=True, category='Side', is_deleted=False),
            MenuItem(id=41, name='Curly Fries', description='Curly fries, or twisted fries are french fries cut into a spiral shape, typically seasoned with a distinct spice mix composed primarily of paprika, black pepper, onion powder, and garlic powder.', price=9.99, image_url='/static/images/7fe70b22-5a8a-4df3-9c59-e30ba5585707.jpg', is_available=True, category='Side', is_deleted=False),
            MenuItem(id=42, name='Mushroom Melt Burger', description='This restaurant-quality Mushroom Swiss Burger has it all: juicy beef patties, melted Swiss cheese, rich caramelized onions, and a savory sautéed mushroom sauce. It is a perfect gourmet-style burger for BBQs and burger nights.', price=19.99, image_url='/static/images/693c26e0-65cc-4d0a-bbdc-b51b9336e0a9.jpg', is_available=True, category='Burger', is_deleted=False)
        ]
        db.add_all(menu_items)
        db.commit()

        print("Data seeded successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
