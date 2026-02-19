import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        # Set default headers for the client
        client.environ_base["HTTP_X_API_KEY"] = "dev-api-key"
        client.environ_base["HTTP_X_PLATFORM"] = "USER_PLATFORM"
        client.environ_base["HTTP_X_ROLE"] = "VIEWER"
        yield client

def test_invalid_event_rejected(client):
    """
    Test that malformed events are rejected with 400.
    """
    res = client.post("/api/user/event", json={
        "session_id": "bad-uuid"
    })
    assert res.status_code == 400
    assert res.json["status"] == "error"

def test_missing_fields_rejected(client):
    """
    Test that missing fields trigger a 400.
    """
    res = client.post("/api/user/event", json={
        "session_id": "11111111-1111-1111-1111-111111111111",
        "domain": "WEB"
    })
    assert res.status_code == 400

def test_wrong_enum_rejected(client):
    """
    Test that invalid enum values are rejected.
    """
    res = client.post("/api/user/event", json={
        "session_id": "11111111-1111-1111-1111-111111111111",
        "domain": "INVALID_DOMAIN",
        "actor_type": "USER",
        "actor_id": "user_1",
        "tenant_id": "tenant_a",
        "ingestion_source": "web_login",
        "timestamp": "2026-02-10T10:30:00Z",
        "payload": {"action": "login"}
    })
    assert res.status_code == 400

def test_empty_payload_rejected(client):
    """
    Test that empty payload is rejected.
    """
    res = client.post("/api/user/event", json={
        "session_id": "11111111-1111-1111-1111-111111111111",
        "domain": "WEB",
        "actor_type": "USER",
        "actor_id": "user_1",
        "tenant_id": "tenant_a",
        "ingestion_source": "web_login",
        "timestamp": "2026-02-10T10:30:00Z",
        "payload": {}
    })
    assert res.status_code == 400

def test_valid_event_accepted(client):
    """
    Test that valid events are accepted with 202 and a canonical hash.
    """
    payload = {
        "session_id": "11111111-1111-1111-1111-111111111111",
        "domain": "WEB",
        "actor_type": "USER",
        "actor_id": "user_1",
        "tenant_id": "tenant_a",
        "ingestion_source": "web_login",
        "timestamp": "2026-02-10T10:30:00Z",
        "payload": {"action": "login"}
    }
    res = client.post("/api/user/event", json=payload)
    assert res.status_code == 202
    assert res.json["status"] == "accepted"
    assert "canonical_hash" in res.json
    assert res.json["session_id"] == "11111111-1111-1111-1111-111111111111"
