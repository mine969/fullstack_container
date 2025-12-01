#!/usr/bin/env python3
"""
Debug script to test the menu endpoint and identify the internal server error.
Run this to see detailed error messages.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from backend.app.models.menu import MenuItem
from backend.app.database import SQLALCHEMY_DATABASE_URL, engine

def check_database_connection():
    """Test database connection"""
    print("=" * 60)
    print("1. Testing Database Connection")
    print("=" * 60)
    print(f"Database URL: {SQLALCHEMY_DATABASE_URL}")
    
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_table_exists():
    """Check if menu_items table exists"""
    print("\n" + "=" * 60)
    print("2. Checking if 'menu_items' table exists")
    print("=" * 60)
    
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Available tables: {tables}")
        
        if 'menu_items' in tables:
            print("✅ 'menu_items' table exists")
            return True
        else:
            print("❌ 'menu_items' table does NOT exist")
            return False
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False

def check_table_columns():
    """Check columns in menu_items table"""
    print("\n" + "=" * 60)
    print("3. Checking 'menu_items' table columns")
    print("=" * 60)
    
    try:
        inspector = inspect(engine)
        columns = inspector.get_columns('menu_items')
        
        print("Columns in menu_items table:")
        for col in columns:
            print(f"  - {col['name']}: {col['type']}")
        
        # Check for required columns
        column_names = [col['name'] for col in columns]
        required_columns = ['id', 'name', 'price', 'is_deleted']
        
        missing = [col for col in required_columns if col not in column_names]
        if missing:
            print(f"\n❌ Missing required columns: {missing}")
            return False
        else:
            print("\n✅ All required columns present")
            return True
            
    except Exception as e:
        print(f"❌ Error checking columns: {e}")
        return False

def test_query():
    """Test the actual query used in the endpoint"""
    print("\n" + "=" * 60)
    print("4. Testing Menu Query")
    print("=" * 60)
    
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # This is the exact query from the endpoint
        items = db.query(MenuItem).filter(MenuItem.is_deleted == False).all()
        
        print(f"✅ Query successful! Found {len(items)} menu items")
        
        for item in items:
            print(f"  - {item.name}: ${item.price}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Query failed: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n🔍 Menu Endpoint Diagnostic Tool\n")
    
    results = {
        "Database Connection": check_database_connection(),
        "Table Exists": check_table_exists(),
        "Table Columns": check_table_columns(),
        "Query Test": test_query()
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test}")
    
    if all(results.values()):
        print("\n✅ All tests passed! The menu endpoint should work.")
        print("If you're still seeing errors, check the API logs.")
    else:
        print("\n❌ Some tests failed. Fix the issues above.")

if __name__ == "__main__":
    main()
