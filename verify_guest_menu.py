import requests

BASE_URL = "https://food-delivery-api-r6ih.onrender.com"

def test_guest_menu_access():
    print(f"\n[TEST] Accessing {BASE_URL}/menu/ as GUEST (No Token)...")
    try:
        response = requests.get(f"{BASE_URL}/menu/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Received 200 OK. Guests CAN see the menu.")
            items = response.json()
            print(f"   Found {len(items)} menu items.")
            return True
        else:
            print(f"❌ FAILURE: Received {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_guest_menu_access()
