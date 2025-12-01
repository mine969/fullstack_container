import requests
import sys

BASE_URL = "http://localhost:3001"
LOGIN_URL = f"{BASE_URL}/auth/login"
MENU_URL = f"{BASE_URL}/menu/"

def test_delete():
    # 1. Login
    print(f"Logging in as admin...")
    try:
        response = requests.post(
            LOGIN_URL,
            data={"username": "admin123@gmail.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        response.raise_for_status()
        token = response.json()["access_token"]
        print("Login successful. Token received.")
    except Exception as e:
        print(f"Login failed: {e}")
        if 'response' in locals():
            print(f"Response: {response.text}")
        sys.exit(1)

    # 2. Create Menu Item
    print(f"Creating menu item...")
    item_data = {
        "name": "Delete Me Burger",
        "description": "To be deleted",
        "price": 10.00,
        "category": "Main"
    }
    try:
        response = requests.post(
            MENU_URL,
            json=item_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            item = response.json()
            item_id = item['id']
            print(f"Menu item created successfully. ID: {item_id}")
        else:
            print(f"Failed to create menu item. Status: {response.status_code}")
            print(f"Response: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Request failed: {e}")
        sys.exit(1)

    # 3. Delete Menu Item
    print(f"Deleting menu item {item_id}...")
    try:
        response = requests.delete(
            f"{MENU_URL}{item_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            print("Menu item deleted successfully.")
            print(response.json())
        else:
            print(f"Failed to delete menu item. Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_delete()
