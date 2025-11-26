import requests

API_URL = "http://localhost:3001"

def test_admin_update():
    print("Logging in as admin...")
    login_data = {"username": "admin123@gmail.com", "password": "admin123"}
    response = requests.post(f"{API_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Item
    print("Creating item...")
    item_data = {
        "name": "Update Test Burger",
        "description": "Original description",
        "price": 10.00,
        "category": "Main"
    }
    resp = requests.post(f"{API_URL}/menu/", json=item_data, headers=headers)
    if resp.status_code != 200:
        print(f"Create failed: {resp.text}")
        return
    item_id = resp.json()["id"]
    print(f"Item created: {item_id}")

    # 2. Update Item (Full)
    print("Updating item (full)...")
    update_data = {
        "name": "Updated Burger",
        "description": "Updated description",
        "price": 12.00,
        "category": "Main",
        "is_available": True
    }
    resp = requests.put(f"{API_URL}/menu/{item_id}", json=update_data, headers=headers)
    if resp.status_code == 200:
        print("Update successful!")
        print(resp.json())
    else:
        print(f"Update failed: {resp.status_code} {resp.text}")

    # 3. Cleanup
    requests.delete(f"{API_URL}/menu/{item_id}", headers=headers)

if __name__ == "__main__":
    test_admin_update()
