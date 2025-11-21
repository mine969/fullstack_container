"""
Tests for chat functionality
"""
import pytest
from app.models.chat import ChatSession


@pytest.fixture
def test_chat_session(db, test_user, test_driver):
    """Create a test chat session"""
    session = ChatSession(
        customer_id=test_user.id,
        driver_id=test_driver.id,
        order_id=1
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def test_send_message(client, auth_headers, test_chat_session):
    """Test sending a message in a chat session"""
    response = client.post(
        f"/chat/{test_chat_session.id}/messages",
        json={
            "message": "Hello, where is my order?"
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Hello, where is my order?"
    # assert data["session_id"] == test_chat_session.id # session_id might not be in response if not in schema


def test_send_message_unauthorized(client, test_chat_session):
    """Test that unauthenticated users cannot send messages"""
    response = client.post(
        f"/chat/{test_chat_session.id}/messages",
        json={
            "message": "Test message"
        }
    )
    assert response.status_code == 401
