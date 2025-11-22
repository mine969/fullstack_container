from app.database import SessionLocal, engine
from app import models, auth

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if not admin:
            print("Creating admin user...")
            hashed_password = auth.get_password_hash("admin123")
            admin_user = models.User(
                email="admin@example.com",
                name="Admin User",
                role="admin",
                hashed_password=hashed_password
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created: admin@example.com / admin123")
        else:
            print("Admin user already exists.")
    except Exception as e:
        print(f"Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
