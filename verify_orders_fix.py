import requests
import uuid

BASE_URL = "https://food-delivery-api-r6ih.onrender.com"

def test_unauthenticated_access():
    print(f"\n[TEST] Accessing {BASE_URL}/orders/ WITHOUT token...")
    try:
        response = requests.get(f"{BASE_URL}/orders/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ SUCCESS: Received 401 Unauthorized (Crash Fixed!)")
            return True
        elif response.status_code == 500:
            print("❌ FAILURE: Received 500 Internal Server Error (Crash STILL happening)")
            return False
        else:
            print(f"⚠️ UNEXPECTED: Received {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_authenticated_access():
    print(f"\n[TEST] Accessing {BASE_URL}/orders/ WITH token...")
    
    # 1. Register a random user
    random_id = str(uuid.uuid4())[:8]
    email = f"test_verify_{random_id}@example.com"
    password = "password123"
    
    print(f"   Registering user: {email}")
    reg_response = requests.post(f"{BASE_URL}/users/", json={
        "email": email,
        "password": password,
        "name": "Verify Bot",
        "role": "customer"
    })
    
    if reg_response.status_code != 200:
        print(f"   ⚠️ Registration failed: {reg_response.status_code} {reg_response.text}")
        return False

    # 2. Login to get token
    login_data = {
        "username": email,
        "password": password
    }
    print("   Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if login_response.status_code != 200:
        print(f"   ⚠️ Login failed: {login_response.status_code} {login_response.text}")
        return False
        
    token = login_response.json().get("access_token")
    if not token:
        print("   ⚠️ No token received")
        return False
        
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Access Orders
    print("   Fetching /orders/ with token...")
    orders_response = requests.get(f"{BASE_URL}/orders/", headers=headers)
    print(f"Status Code: {orders_response.status_code}")
    
    if orders_response.status_code == 200:
        print("✅ SUCCESS: Received 200 OK (Authenticated access working)")
        # print("Response:", orders_response.json())
        return True
    elif orders_response.status_code == 500:
        print("❌ FAILURE: Received 500 Internal Server Error")
        return False
    else:
        print(f"⚠️ UNEXPECTED: Received {orders_response.status_code}")
        return False

if __name__ == "__main__":
    print(f"Target: {BASE_URL}")
    success_unauth = test_unauthenticated_access()
    
    # Only run authenticated if unauth "succeeds" (meaning it handled the error correctly)
    # But for debugging, we run both.
    success_auth = test_authenticated_access()
    
    if success_unauth and success_auth:
        print("\n🎉 ALL CHECKS PASSED: The API is fixed and working correctly.")
    else:
        print("\n⚠️ SOME CHECKS FAILED.")
