
import requests
import time
import math
import uuid
import random
import threading

# CONFIG
BASE_URL = "http://127.0.0.1:5000/api/v1/live/ingest"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "dev-api-key",
    "X-Platform": "SECURITY_PLATFORM",
    "X-Role": "ADMIN"
}

# Heartbeat Pattern (P, QRS, T)
PATTERN = [
    (0.0, 10, "Normal"),
    (0.1, 30, "Suspicious Probe"), # P
    (0.1, 10, "Normal"),
    (0.05, 95, "CRITICAL ANOMALY (Heartbeat)"), # R (Spike)
    (0.05, 5,  "Normal"),
    (0.2, 40, "Data Exfiltration Attempt"), # T
    (0.2, 10, "Normal"),
    (0.5, 10, "Normal") # Rest
]

def send_beat(domain, session_id, endpoint_suffix):
    url = f"{BASE_URL}/{endpoint_suffix}"
    print(f">>> Pulse for {domain} (Session {session_id})")
    
    for delay, risk, label in PATTERN:
        try:
            # Construct Domain-Specific Payload
            payload = {
                "session_id": session_id,
                "risk_score": risk,
                "details": label,
                "timestamp": time.time()
            }
            
            if domain == "WEB":
                payload.update({
                    "method": "GET",
                    "path": "/health-check",
                    "ip": "10.0.0.1",
                    "status_code": 200,
                    "user_agent": "HeartbeatSim/1.0"
                })
            elif domain == "API":
                payload.update({
                    "endpoint": "/v1/users/status",
                    "token_id": "jwt_test_token",
                    "usage_count": random.randint(1, 50),
                    "ip": "10.0.2.2"
                })
            elif domain == "NETWORK":
                payload.update({
                    "source_ip": "192.168.1.100",
                    "dest_port": 443,
                    "protocol": "TCP",
                    "packet_size": random.randint(64, 1500)
                })
            elif domain == "SYSTEM": # INFRA
                payload.update({
                    "hostname": "prod-server-01",
                    "cpu_load": random.randint(10, 30) + (risk * 0.5), # Correlate load with risk
                    "memory_usage": 45.5,
                    "process_count": 120
                })
            
            requests.post(url, json=payload, headers=HEADERS)
            time.sleep(delay)
            
        except Exception as e:
            print(f"Error sending to {domain}: {e}")

def run_heartbeat(domain, endpoint):
    session_id = f"{domain}_HEARTBEAT_{uuid.uuid4().hex[:6].upper()}"
    while True:
        send_beat(domain, session_id, endpoint)
        time.sleep(1.0) # Gap between beats

if __name__ == "__main__":
    print("--- Starting Multi-Domain Heartbeat Simulation (Ctrl+C to stop) ---")
    
    # Start threads for each domain to run in parallel
    domains = [
        ("WEB", "http"),
        ("API", "api"),
        ("NETWORK", "network"),
        ("SYSTEM", "infra")
    ]
    
    threads = []
    for d, ep in domains:
        t = threading.Thread(target=run_heartbeat, args=(d, ep))
        t.daemon = True # Kill when main thread exits
        t.start()
        threads.append(t)
        
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopped.")
