"""
Tests for order management endpoints
"""
import pytest
from app.models.menu import MenuItem
from app.models.order import Order


@pytest.fixture
def test_menu_item(db):
    """Create a test menu item"""
    item = MenuItem(
        name="Test Burger",
        description="Test burger",
        price=10.00,
        category="Main",
        is_available=True
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def test_create_order(client, auth_headers, test_menu_item):
    """Test creating an order"""
    response = client.post(
        "/orders/",
        json={
            "items": [
                {
                    "menu_item_id": test_menu_item.id,
                    "quantity": 2
                }
            ],
            "delivery_address": "123 Test St"
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "pending"


def test_create_order_unauthorized(client, test_menu_item):
    """Test that unauthenticated users cannot create orders"""
    response = client.post(
        "/orders/",
        json={
            "items": [
                {
                    "menu_item_id": test_menu_item.id,
                    "quantity": 1
                }
            ],
            "delivery_address": "123 Test St"
        }
    )
    assert response.status_code == 401


def test_list_orders_as_customer(client, auth_headers, test_user, db):
    """Test that customers only see their own orders"""
    # Create an order for the test user
    order = Order(customer_id=test_user.id, total_amount=20.00, status="PENDING", delivery_address="123 Test St")
    db.add(order)
    db.commit()
    
    response = client.get("/orders/", headers=auth_headers)
    assert response.status_code == 200
    orders = response.json()
    assert isinstance(orders, list)
    # All orders should belong to the current user
    for order in orders:
        assert order["customer_id"] == test_user.id


def test_list_orders_as_manager(client, test_manager, db, test_user):
    """Test that managers see all orders"""
    # Login as manager
    login_response = client.post(
        "/auth/login",
        data={"username": test_manager.email, "password": "managerpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create orders for different users
    order1 = Order(customer_id=test_user.id, total_amount=15.00, status="PENDING", delivery_address="123 Test St")
    order2 = Order(customer_id=test_manager.id, total_amount=25.00, status="COMPLETED", delivery_address="456 Manager Ave")
    db.add_all([order1, order2])
    db.commit()
    
    response = client.get("/orders/", headers=headers)
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) >= 2  # Manager sees all orders
