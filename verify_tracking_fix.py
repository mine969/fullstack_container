import requests
import json
import uuid

API_URL = "http://localhost:3001"

def verify_tracking_fix():
    print("1. Creating a new guest order...")
    # 1. Create Order
    order_data = {
        "items": [
            {"menu_item_id": 1, "quantity": 1} # Assuming item 1 exists from seed
        ],
        "delivery_address": "123 Verification St",
        "guest_name": "Verify User",
        "guest_phone": "555-0199"
    }
    
    try:
        resp = requests.post(f"{API_URL}/orders/", json=order_data)
        if resp.status_code != 200:
            print(f"FAILED: Order creation failed. {resp.status_code} {resp.text}")
            return

        order = resp.json()
        print("Order Created Successfully!")
        print(f"Order ID: {order.get('id')}")
        
        # We expect ID to be present and numeric (int)
        order_id = order.get('id')
        if not order_id or not isinstance(order_id, int):
             print("FAILED: Order ID invalid or missing")
             return

        print("PASS: Numeric Order ID generated correctly.")

        # 2. Track Request using Numeric ID
        print(f"2. Testing tracking endpoint with ID: {order_id}")
        track_resp = requests.get(f"{API_URL}/guest/track/{order_id}")
        
        if track_resp.status_code == 200:
            print("PASS: Tracking endpoint returned success.")
            tracked_order = track_resp.json()
            if tracked_order['id'] == order['id']:
                print("PASS: Tracked order matches original order.")
            else:
                print("FAILED: Tracked order ID mismatch.")
        else:
            print(f"FAILED: Tracking endpoint error. {track_resp.status_code} {track_resp.text}")

    except Exception as e:
        print(f"ERROR: Execution failed: {str(e)}")
        print("Is the backend server running on port 3001?")

if __name__ == "__main__":
    verify_tracking_fix()
