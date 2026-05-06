import requests
import time
import uuid
import random

BASE_URL = "http://127.0.0.1:5000/api/v1/live/ingest"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "dev-api-key",
    "X-Platform": "USER_PLATFORM",
    "X-Role": "ADMIN"
}

SCENARIOS = [
    # (domain, risk, actor_id, details)
    ("http", 5, "verified_user_1", "Routine Page Navigation"),
    ("http", 15, "verified_user_2", "Dashboard Load"),
    ("http", 10, "anonymous", "Marketing Site Visit"),
    
    # RESTRICT (Risk ~45)
    ("http", 45, "anonymous", "Rapid Form Submission"),
    ("api", 55, "api_client_88", "Unusual Data Query Volume"),
    ("network", 50, "anonymous", "Unexpected Port Scan Attempt"),

    # ESCALATE (Risk ~75)
    ("http", 75, "anonymous", "Suspicious Geo-Velocity Login"),
    ("api", 80, "api_client_99", "Failed API Auth Spikes"),
    ("infra", 85, "anonymous", "High CPU Load from Unknown Process"),

    # TERMINATE (Risk ~95+)
    ("http", 95, "anonymous", "Credential Stuffing Wave"),
    ("api", 98, "anonymous", "Shadow API Endpoint Access"),
    ("network", 99, "anonymous", "C2 Heartbeat Detected"),
    ("infra", 100, "anonymous", "Ransomware Encryption Activity")
]

print("--- Populating Session Explorer with Diverse Data ---")

for i in range(25):
    domain, risk, base_actor, details = random.choice(SCENARIOS)
    
    # Create a unique session ID and slightly tweak the actor
    session_id = f"SESS-SIM-{uuid.uuid4().hex[:6].upper()}"
    actor_id = f"{base_actor}_{i}" if base_actor != "anonymous" else "anonymous"
    
    # Introduce slight random variations to risk
    actual_risk = min(100, max(0, risk + random.randint(-5, 5)))
    
    payload = {
        "session_id": session_id,
        "actor_id": actor_id,
        "risk_score": actual_risk,
        "details": details,
        "timestamp": time.time()
    }

    url = f"{BASE_URL}/{domain}"
    try:
        res = requests.post(url, json=payload, headers=HEADERS)
        print(f"[{domain.upper()}] Session {session_id} -> Risk: {actual_risk} ({details})")
    except Exception as e:
        print(f"Failed to post: {e}")
        
    time.sleep(0.1)  # tiny delay to ensure proper ordering in DB

print("\nFinished populating Session Explorer!")
