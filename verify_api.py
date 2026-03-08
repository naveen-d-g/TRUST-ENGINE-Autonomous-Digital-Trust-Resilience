from backend.app import create_app
import json

app = create_app()
with app.test_client() as client:
    headers = {
        "X-API-Key": "dev-api-key",
        "X-Role": "ADMIN",
        "X-Platform": "SECURITY_PLATFORM"
    }
    response = client.get("/api/v1/metrics/summary", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.get_json()
        print("--- FULL METRICS ---")
        print(json.dumps(data.get('metrics', {}), indent=2))
        print(f"Global Risk Score from API: {data.get('metrics', {}).get('global_risk_score')}")
    else:
        print(f"Error: {response.get_data(as_text=True)}")
