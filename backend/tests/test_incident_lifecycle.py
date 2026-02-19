import pytest
from backend.app import app
from backend.extensions import db
from backend.incidents.models import Incident
from backend.incidents.lifecycle import IncidentState

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    # Bypassing the strict check in config.py if it's there
    from backend.config import Config
    Config.SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

@pytest.fixture
def headers_admin():
    return {
        "X-Role": "ADMIN",
        "X-Platform": "SECURITY_PLATFORM",
        "X-API-Key": "dev-api-key"
    }

@pytest.fixture
def headers_analyst():
    return {
        "X-Role": "ANALYST",
        "X-Platform": "SECURITY_PLATFORM",
        "X-API-Key": "dev-api-key"
    }

def test_full_incident_lifecycle(client, headers_admin):
    """
    Test 9️⃣: FULL LIFECYCLE (MANDATORY)
    OPEN -> CONTAINED -> RECOVERING -> RESOLVED -> CLOSED
    """
    # 1. Create Incident
    res = client.post("/api/soc/incidents", json={"severity": "HIGH"}, headers=headers_admin)
    assert res.status_code == 201, f"Create failed: {res.json}"
    incident_id = res.json["incident_id"]
    assert res.json["state"] == "OPEN"

    # 2. Transition to CONTAINED
    res = client.post(f"/api/soc/incidents/{incident_id}/contain", headers=headers_admin)
    assert res.status_code == 200, f"Contain failed: {res.json}"
    assert res.json["state"] == "CONTAINED"

    # 3. Transition to RECOVERING
    res = client.post(f"/api/soc/incidents/{incident_id}/recover", headers=headers_admin)
    assert res.status_code == 200, f"Recover failed: {res.json}"
    assert res.json["state"] == "RECOVERING"

    # 4. Transition to RESOLVED
    res = client.post(f"/api/soc/incidents/{incident_id}/resolve", headers=headers_admin)
    assert res.status_code == 200, f"Resolve failed: {res.json}"
    assert res.json["state"] == "RESOLVED"

    # 5. Transition to CLOSED
    res = client.post(f"/api/soc/incidents/{incident_id}/close", headers=headers_admin)
    assert res.status_code == 200, f"Close failed: {res.json}"
    assert res.json["state"] == "CLOSED"

def test_invalid_transition_fails(client, headers_admin):
    """
    Test 🔍: Invalid transition (OPEN -> CLOSED) must fail.
    """
    res = client.post("/api/soc/incidents", json={"severity": "LOW"}, headers=headers_admin)
    incident_id = res.json["incident_id"]

    res = client.post(f"/api/soc/incidents/{incident_id}/close", headers=headers_admin)
    assert res.status_code == 400
    assert "Invalid incident transition" in res.json["error"]

def test_rbac_restriction(client, headers_analyst):
    """
    Test 🔍: ANALYST role must be denied for ADMIN-only transitions.
    """
    # Create incident first (as ADMIN, using headers_admin internally or just assuming it exists)
    import uuid
    from backend.app import app
    with app.app_context():
        inc = Incident(incident_id=str(uuid.uuid4()), severity="MEDIUM")
        db.session.add(inc)
        db.session.commit()
        iid = inc.incident_id

    res = client.post(f"/api/soc/incidents/{iid}/contain", headers=headers_analyst)
    assert res.status_code == 403
    assert res.json["code"] == "ROLE_VIOLATION"

def test_idempotency(client, headers_admin):
    """
    Test 8️⃣: IDEMPOTENCY RULE
    Transition to same state must be 200 but already_in_state: true.
    """
    res = client.post("/api/soc/incidents", json={"severity": "MEDIUM"}, headers=headers_admin)
    incident_id = res.json["incident_id"]

    client.post(f"/api/soc/incidents/{incident_id}/contain", headers=headers_admin)
    
    # Repeat transition
    res = client.post(f"/api/soc/incidents/{incident_id}/contain", headers=headers_admin)
    assert res.status_code == 200
    assert res.json["already_in_state"] == True
