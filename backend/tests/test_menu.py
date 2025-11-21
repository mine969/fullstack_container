"""
Tests for menu management endpoints
"""
import pytest


def test_get_menu_items(client):
    """Test getting menu items (public endpoint)"""
    response = client.get("/menu/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_menu_item_as_manager(client, test_manager):
    """Test creating menu item as manager"""
    # Login as manager
    login_response = client.post(
        "/auth/login",
        data={"username": test_manager.email, "password": "managerpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create menu item
    response = client.post(
        "/menu/",
        json={
            "name": "Burger",
            "description": "Delicious beef burger",
            "price": 9.99,
            "category": "Main Course",
            "available": True
        },
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Burger"
    assert float(data["price"]) == 9.99


def test_create_menu_item_as_customer(client, auth_headers):
    """Test that customers cannot create menu items"""
    response = client.post(
        "/menu/",
        json={
            "name": "Pizza",
            "description": "Cheese pizza",
            "price": 12.99,
            "category": "Main Course",
            "available": True
        },
        headers=auth_headers
    )
    assert response.status_code == 403  # Forbidden


def test_create_menu_item_unauthorized(client):
    """Test that unauthenticated users cannot create menu items"""
    response = client.post(
        "/menu/",
        json={
            "name": "Salad",
            "description": "Fresh salad",
            "price": 7.99,
            "category": "Appetizer",
            "available": True
        }
    )
    assert response.status_code == 401  # Unauthorized
