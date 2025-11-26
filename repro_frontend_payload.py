import requests
import json

API_URL = "http://localhost:3001"

def test_frontend_payload():
    # 1. Login as admin
    print("Logging in as admin...")
    login_data = {"username": "admin123@gmail.com", "password": "admin123"}
    response = requests.post(f"{API_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Menu Item with STRING price (mimicking frontend)
    print("Creating menu item with string price...")
    item_data = {
        "name": "Frontend Payload Burger",
        "description": "Testing string price",
        "price": "15.50", # String!
        "category": "Main"
    }
    
    resp = requests.post(f"{API_URL}/menu/", json=item_data, headers=headers)
    if resp.status_code == 200:
        print("Success! Backend accepted string price.")
        print(resp.json())
        # Cleanup
        item_id = resp.json()["id"]
        requests.delete(f"{API_URL}/menu/{item_id}", headers=headers)
    else:
        print(f"Failed! Backend rejected string price.")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

if __name__ == "__main__":
    test_frontend_payload()
