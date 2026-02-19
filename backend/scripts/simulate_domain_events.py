import requests
import json
import time
import random
import uuid
from datetime import datetime

BASE_URL = "http://localhost:5000/api/v1/monitoring/ingest"

# Simulation configuration
DOMAINS = ["WEB", "API", "NETWORK", "SYSTEM"]
EVENT_TYPES = {
    "WEB": ["PAGE_VIEW", "LOGIN_ATTEMPT", "SQL_INJECTION_ATTEMPT", "XSS_ATTEMPT"],
    "API": ["API_CALL", "AUTH_FAILURE", "RATE_LIMIT_EXCEEDED", "DATA_EXPORT"],
    "NETWORK": ["PACKET_FLOW", "PORT_SCAN", "DDOS_ATTEMPT", "LATERAL_MOVEMENT"],
    "SYSTEM": ["PROCESS_START", "FILE_ACCESS", "ROOT_ESCALATION", "CPU_SPIKE"]
}

def generate_event(domain):
    event_type = random.choice(EVENT_TYPES[domain])
    
    # Base risk
    risk_score = random.randint(0, 20)
    
    # Inject anomalies
    payload = {}
    if "ATTEMPT" in event_type or "FAILURE" in event_type or "SCAN" in event_type or "ESCALATION" in event_type:
        risk_score = random.randint(60, 95)
        payload["details"] = "Suspicious activity detected"
    
    if domain == "WEB":
        if event_type == "SQL_INJECTION_ATTEMPT":
            payload["sqli_count"] = random.randint(1, 5)
        elif event_type == "XSS_ATTEMPT":
            payload["xss_count"] = random.randint(1, 3)
            
    elif domain == "API":
        if event_type == "AUTH_FAILURE":
            payload["5xx_rate"] = random.random()
            
    elif domain == "NETWORK":
        if event_type == "DDOS_ATTEMPT":
             payload["packet_spike"] = random.randint(1000, 5000)
             
    elif domain == "SYSTEM":
        if event_type == "CPU_SPIKE":
            payload["cpu_spike"] = random.randint(90, 100)

    event = {
        "event_id": str(uuid.uuid4()),
        "domain": domain,
        "session_id": f"sess-{uuid.uuid4().hex[:8]}",
        "actor_id": f"user-{random.randint(1000, 9999)}",
        "ip": f"192.168.1.{random.randint(1, 255)}",
        "route": f"/{domain.lower()}/{event_type.lower().replace('_', '-')}",
        "timestamp": datetime.utcnow().isoformat(),
        "payload": payload
    }
    
    return event

def simulate():
    print(f"Starting simulation. Target: {BASE_URL}")
    try:
        while True:
            for domain in DOMAINS:
                # Simulate realistic volume: Web > API > Network > System
                if domain == "WEB": count = 3
                elif domain == "API": count = 2
                else: count = 1
                
                for _ in range(count):
                    event = generate_event(domain)
                    try:
                        headers = {
                            "Content-Type": "application/json",
                            "X-API-Key": "dev-api-key",
                            "X-Platform": "SECURITY_PLATFORM",
                            "X-Role": "ADMIN"
                        }
                        resp = requests.post(BASE_URL, json=event, headers=headers)
                        if resp.status_code == 200:
                            print(f"[{domain}] Sent {event['route']} -> {resp.json().get('status')}")
                        else:
                            print(f"[{domain}] Error: {resp.text}")
                    except Exception as e:
                        print(f"[{domain}] Connection failed: {e}")
            
            time.sleep(1) # Wait 1 second before next batch
            
    except KeyboardInterrupt:
        print("Simulation stopped.")

if __name__ == "__main__":
    simulate()
