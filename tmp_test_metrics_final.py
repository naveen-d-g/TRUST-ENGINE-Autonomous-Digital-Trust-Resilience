from backend.app import create_app
from backend.extensions import db
import json

app = create_app()
with app.app_context():
    from flask import request
    # Mocking a request for the decorator
    with app.test_client() as client:
        # Note: We need a valid API key and Role ADMIN to bypass require_access
        headers = {
            "X-API-Key": "dev-api-key",
            "X-Role": "ADMIN"
        }
        response = client.get("/api/v1/metrics/summary", headers=headers)
        data = response.get_json()
        print(f"Status: {response.status_code}")
        print(f"Metrics: {json.dumps(data.get('metrics', {}), indent=2)}")
        print(f"Avg Trust: {data.get('average_trust_score')}")
