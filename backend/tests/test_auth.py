"""
Tests for authentication endpoints
"""
import pytest


def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post(
        "/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    """Test login with incorrect password"""
    response = client.post(
        "/auth/login",
        data={
            "username": test_user.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Test login with non-existent email"""
    response = client.post(
        "/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "anypassword"
        }
    )
    assert response.status_code == 401


def test_token_expiration(client, test_user):
    """Test that token contains expiration"""
    response = client.post(
        "/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    
    # Decode token to check expiration (without verification for testing)
    from jose import jwt
    from app.auth import SECRET_KEY, ALGORITHM
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_signature": False})
    assert "exp" in payload
    assert "sub" in payload
    assert payload["sub"] == test_user.email
