import requests
import json

BASE_URL = "https://food-delivery-api-r6ih.onrender.com"

def test_create_and_track_guest_order():
    print(f"\n[TEST] Creating Guest Order on {BASE_URL}...")
    
    # 1. Get Menu Item ID (any)
    try:
        menu_res = requests.get(f"{BASE_URL}/menu/")
        if menu_res.status_code != 200 or not menu_res.json():
            print("❌ FAILURE: Could not fetch menu items.")
            return False
        menu_item_id = menu_res.json()[0]['id']
    except Exception as e:
        print(f"❌ ERROR fetching menu: {e}")
        return False

    # 2. Create Order
    order_payload = {
        "items": [{"menu_item_id": menu_item_id, "quantity": 1}],
        "delivery_address": "123 Test St",
        "guest_name": "Tracking Verify",
        "guest_phone": "555-0199",
        "guest_email": "track@example.com"
    }
    
    try:
        # Note: Guest order creation does NOT require auth headers
        create_res = requests.post(f"{BASE_URL}/orders/", json=order_payload)
        print(f"   Create Status: {create_res.status_code}")
        
        if create_res.status_code != 200:
            print(f"❌ FAILURE: Create Order failed: {create_res.text}")
            return False
            
        order_data = create_res.json()
        tracking_id = order_data.get("tracking_id")
        order_id = order_data.get("id")
        
        print(f"   ✅ Order Created. ID: {order_id}, Tracking ID: {tracking_id}")
        
        if not tracking_id:
            print("❌ FAILURE: No tracking_id returned in response.")
            return False
            
    except Exception as e:
        print(f"❌ ERROR creating order: {e}")
        return False

    # 3. Track Order
    print(f"\n[TEST] Tracking Order {tracking_id}...")
    try:
        track_res = requests.get(f"{BASE_URL}/guest/track/{tracking_id}")
        print(f"   Track Status: {track_res.status_code}")
        
        if track_res.status_code == 200:
            print("✅ SUCCESS: Tracking worked!")
            print(f"   Status: {track_res.json().get('status')}")
            return True
        else:
            print(f"❌ FAILURE: Tracking failed: {track_res.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR tracking: {e}")
        return False

if __name__ == "__main__":
    test_create_and_track_guest_order()
