import requests

# Try both localhost and the deployed URL if known, but let's start with localhost where we saw it working before
# If user is testing on DEPLOYED env, we should ask for URL or assume it.
# Let's assume user is testing locally first or provide a way to switch.

API_URL = "http://localhost:3001" 
# Verify if creating an order and tracking it works nicely
# If this works locally, then the issue is likely data mismatch on production (e.g. wiped DB)

def test_tracking():
    print("1. Creating order...")
    resp = requests.post(f"{API_URL}/orders/", json={
        "items": [{"menu_item_id": 1, "quantity": 1}],
        "delivery_address": "Test St",
        "guest_name": "Tester",
        "guest_phone": "123"
    })
    
    if resp.status_code != 200:
        print(f"Create failed: {resp.text}")
        return

    order_id = resp.json()['id']
    print(f"Created Order ID: {order_id}")

    print(f"2. Tracking Order ID: {order_id}")
    track_resp = requests.get(f"{API_URL}/guest/track/{order_id}")
    
    if track_resp.status_code == 200:
        print("SUCCESS: Found order!")
        print(track_resp.json())
    else:
        print(f"FAILURE: {track_resp.status_code} {track_resp.text}")

if __name__ == "__main__":
    test_tracking()
