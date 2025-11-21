from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
try:
    print(f"Hashing 'securepassword'...")
    hashed = pwd_context.hash("securepassword")
    print(f"Success: {hashed}")
except Exception as e:
    print(f"Error: {e}")
