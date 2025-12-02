import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, SQLALCHEMY_DATABASE_URL
from app.models.menu import MenuItem

def fix_image_urls():
    print("Connecting to database...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        print("Checking for image URLs to fix...")
        # Find items with relative paths
        items = db.query(MenuItem).filter(MenuItem.image_url.like('/static/images/%')).all()
        
        if not items:
            print("No items found with relative image paths. Database is already correct.")
            return

        print(f"Found {len(items)} items to update.")
        
        base_url = "https://food-delivery-api-r6ih.onrender.com"
        count = 0
        
        for item in items:
            if item.image_url.startswith('/static/images/'):
                old_url = item.image_url
                new_url = base_url + old_url
                item.image_url = new_url
                count += 1
                print(f"Updated: {old_url} -> {new_url}")
        
        db.commit()
        print(f"Successfully updated {count} image URLs!")
        
    except Exception as e:
        print(f"Error updating images: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_image_urls()
