import requests

API_URL = "http://localhost:3001"

def test_admin_drivers():
    print("Logging in as admin...")
    login_data = {"username": "admin123@gmail.com", "password": "admin123"}
    response = requests.post(f"{API_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("Fetching drivers as admin...")
    resp = requests.get(f"{API_URL}/users/drivers", headers=headers)
    if resp.status_code == 200:
        print("Success! Admin can fetch drivers.")
        print(resp.json())
    else:
        print(f"Failed! Admin cannot fetch drivers.")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

if __name__ == "__main__":
    test_admin_drivers()
