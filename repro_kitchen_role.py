import requests
import json

API_URL = "http://localhost:3001"

def test_kitchen_role():
    # 1. Create Kitchen User
    kitchen_email = "kitchen_test@example.com"
    kitchen_password = "password123"
    
    print("Creating kitchen user...")
    user_data = {
        "email": kitchen_email,
        "password": kitchen_password,
        "name": "Kitchen Staff",
        "role": "kitchen"
    }
    response = requests.post(f"{API_URL}/users/", json=user_data)
    if response.status_code == 201:
        print("Kitchen user created.")
    elif response.status_code == 400 and "already registered" in response.text:
        print("Kitchen user already exists.")
    else:
        print(f"Failed to create kitchen user: {response.text}")
        # Try login anyway

    # 2. Login as Kitchen
    print("Logging in as kitchen...")
    login_data = {
        "username": kitchen_email,
        "password": kitchen_password
    }
    response = requests.post(f"{API_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Kitchen login successful.")

    # 3. Create an Order (as admin to ensure it exists, or just use kitchen token if allowed to create order?)
    # Usually customers create orders. Let's login as admin to create an order.
    print("Logging in as admin to create order...")
    admin_login = {"username": "admin123@gmail.com", "password": "admin123"}
    resp = requests.post(f"{API_URL}/auth/login", data=admin_login)
    admin_token = resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create a menu item first to order
    item_data = {
        "name": "Order Test Burger",
        "price": 10.0,
        "category": "Main"
    }
    resp = requests.post(f"{API_URL}/menu/", json=item_data, headers=admin_headers)
    menu_item_id = resp.json().get("id")
    if not menu_item_id:
        # Maybe item already exists or failed, try to list and pick one
        resp = requests.get(f"{API_URL}/menu/")
        items = resp.json()
        if items:
            menu_item_id = items[0]["id"]
        else:
            print("No menu items to order.")
            return

    print(f"Creating order for item {menu_item_id}...")
    order_data = {
        "items": [{"menu_item_id": menu_item_id, "quantity": 1}],
        "delivery_address": "Kitchen Test Address",
        "guest_name": "Guest",
        "guest_phone": "1234567890"
    }
    # Create order as guest (no auth)
    resp = requests.post(f"{API_URL}/orders/", json=order_data)
    if resp.status_code != 200:
        print(f"Failed to create order: {resp.text}")
        return
    
    order_id = resp.json()["id"]
    print(f"Order {order_id} created.")

    # 4. Update Status as Kitchen
    print(f"Updating order {order_id} status to 'cooking' as kitchen...")
    status_data = {"status": "cooking"}
    resp = requests.put(f"{API_URL}/orders/{order_id}/status", json=status_data, headers=headers)
    
    if resp.status_code == 200:
        print("Status update successful!")
        print(resp.json())
    else:
        print(f"Status update failed: {resp.status_code} {resp.text}")

    # 5. Verify Tracking (by Order ID)
    print(f"Verifying tracking endpoint for Order ID {order_id}...")
    resp = requests.get(f"{API_URL}/guest/track/{order_id}")
    if resp.status_code == 200:
        print("Tracking endpoint works!")
        print(resp.json())
    else:
        print(f"Tracking endpoint failed: {resp.status_code} {resp.text}")

    # 6. Verify Delivery Assignment (Kitchen Role)
    # Need a driver first
    driver_email = "driver_test@example.com"
    driver_password = "password123"
    print("Creating driver user...")
    driver_data = {"email": driver_email, "password": driver_password, "name": "Driver", "role": "driver"}
    requests.post(f"{API_URL}/users/", json=driver_data)
    
    # Get driver ID (login to get it or assume from creation if it returned it, but creation might fail if exists)
    # Let's login as driver to get ID
    resp = requests.post(f"{API_URL}/auth/login", data={"username": driver_email, "password": driver_password})
    if resp.status_code == 200:
        driver_token = resp.json()["access_token"]
        # Get me
        resp = requests.get(f"{API_URL}/users/me", headers={"Authorization": f"Bearer {driver_token}"})
        driver_id = resp.json()["id"]
        
        print(f"Assigning driver {driver_id} to order {order_id} as kitchen...")
        assign_data = {"driver_id": driver_id}
        resp = requests.put(f"{API_URL}/orders/{order_id}/assign", json=assign_data, headers=headers)
        if resp.status_code == 200:
            print("Driver assignment successful!")
            print(resp.json())
        else:
            print(f"Driver assignment failed: {resp.status_code} {resp.text}")
    else:
        print("Failed to login as driver to get ID.")

if __name__ == "__main__":
    test_kitchen_role()
