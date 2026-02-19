import pytest
from backend.app import app
from backend.auth.platform import Platform
from backend.auth.roles import Role

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.test_client() as client:
        with app.app_context():
            from backend.extensions import db
            db.create_all()
        yield client

def test_user_cannot_access_soc(client):
    """
    SOC routes must be rejected if Platform is USER.
    """
    r = client.get(
        "/api/soc/incidents",
        headers={
            "X-API-Key": "dev-api-key",
            "X-Platform": Platform.USER.value,
            "X-Role": Role.VIEWER.value
        }
    )
    assert r.status_code == 403
    assert "Platform Context Violation" in r.json["error"]

def test_analyst_cannot_recover(client):
    """
    Analysts cannot perform ADMIN actions (recovery).
    """
    r = client.post(
        "/api/soc/incidents/123/recover",
        headers={
            "X-API-Key": "dev-api-key",
            "X-Platform": Platform.SECURITY.value,
            "X-Role": Role.ANALYST.value
        }
    )
    assert r.status_code == 403
    assert "Insufficient Privileges" in r.json["error"]

def test_missing_headers_rejected(client):
    """
    Global middleware must reject missing mandatory headers with 400.
    """
    r = client.get("/api/soc/incidents")
    assert r.status_code == 400
    assert "Missing header" in r.text

def test_valid_soc_access(client):
    """
    SOC Admin should have full access to incidents.
    Note: endpoint returns 404 (Not Found) if incident 123 doesn't exist, 
    but 403 (Forbidden) if RBAC fails.
    """
    r = client.post(
        "/api/soc/incidents/123/recover",
        headers={
            "X-API-Key": "dev-api-key",
            "X-Platform": Platform.SECURITY.value,
            "X-Role": Role.ADMIN.value
        }
    )
    # If we get 404, it means we passed the RBAC guard.
    assert r.status_code in [200, 404]

def test_ingestion_requires_user_platform(client):
    """
    Ingestion must fail if accessed from SECURITY_PLATFORM (Isolation).
    """
    r = client.post(
        "/api/user/event",
        headers={
            "X-API-Key": "dev-api-key",
            "X-Platform": Platform.SECURITY.value,
            "X-Role": Role.ADMIN.value
        },
        json={"session_id": "11111111-1111-1111-1111-111111111111"}
    )
    assert r.status_code == 403
    assert "Platform Context Violation" in r.json["error"]
