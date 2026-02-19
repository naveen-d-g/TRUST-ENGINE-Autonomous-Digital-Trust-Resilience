
import requests
import time
import uuid
import random
import threading
import sys
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# CONFIG
BASE_URL = "http://127.0.0.1:5000/api/v1/live/ingest"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "dev-api-key",
    "X-Platform": "SECURITY_PLATFORM",
    "X-Role": "ADMIN"
}

# Robust Session with Retries
def get_session():
    s = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    s.mount('http://', HTTPAdapter(max_retries=retries))
    return s

# Domain Stories: (Duration, Risk, Label, Recommendation)
STORIES = {
    "WEB": [ # Credential Stuffing (Step-Up Pattern)
        (1.0, 10, "Normal User Traffic", None),
        (0.5, 30, "Failed Login Attempt", None),
        (0.5, 60, "Multiple Failed Logins (IP)", "⚠️ Warning: Rate Limit Login & Check IP Reputation"),
        (5.0, 90, "Credential Stuffing Wave", "🛑 CRITICAL: Block IP Subnet & Enforce CAPTCHA"),
        (1.0, 20, "Traffic Normalizing", None)
    ],
    "API": [ # Shadow API / Data Exfil (Bursty Spikes)
        (1.0, 15, "Standard API Calls", None),
        (0.2, 95, "Shadow API Endpoint Access", "🚨 URGENT: Block Undocumented Endpoint & Audit Logs"),
        (0.5, 15, "Standard API Calls", None),
        (5.0, 88, "Mass Data Export Attempt", "⚡ ACTION: Revoke API Key & Investigate Data Loss"),
        (1.0, 10, "Cooling Down", None)
    ],
    "NETWORK": [ # C2 Beaconing (Rhythmic/Oscillating)
        (1.5, 5, "Baseline Traffic", None),
        (0.2, 45, "Unusual Outbound Packet", None),
        (1.5, 5, "Baseline Traffic", None),
        (5.0, 75, "C2 Heartbeat Detected", "🛡️ Alert: Block C2 Domain & Inspect Host"),
        (1.5, 5, "Baseline Traffic", None)
    ],
    "SYSTEM": [ # Ransomware (Quiet then Critical Sustained)
        (1.0, 10, "Idle System", None),
        (1.0, 12, "Background Services", None),
        (0.5, 80, "Suspicious PowerShell Script", "⚠️ Warning: Review PowerShell Execution Policy"),
        (8.0, 100, "Ransomware Encryption Activity", "☢️ EMERGENCY: Isolate Host, Kill Process & Restore Backup"),
    ]
}

def run_story(domain, endpoint_suffix):
    session_id = f"{domain}_SIM_{uuid.uuid4().hex[:6].upper()}"
    story_idx = 0
    story = STORIES[domain]
    
    # Create a robust session for this thread
    http = get_session()
    
    print(f"[{domain}] Starting Simulation Story on Session {session_id}")
    
    while True:
        # Loop through the story pattern
        delay, risk, label, rec = story[story_idx]
        
        try:
            payload = {
                "session_id": session_id,
                "risk_score": risk,
                "details": label,
                "timestamp": time.time()
            }
            
            # Add Domain Specifics
            if domain == "WEB":
                payload.update({"method": "POST", "path": "/login", "ip": "192.168.1.50", "status_code": 403 if risk > 80 else 200})
            elif domain == "API":
                payload.update({"endpoint": "/v1/admin/users", "token_id": "captured_token", "usage_count": 999})
            elif domain == "NETWORK":
                payload.update({"source_ip": "10.0.0.66", "procotol": "UDP", "dest_port": 53})
            elif domain == "SYSTEM":
                payload.update({"hostname": "db-prod-01", "cpu_load": 99.9 if risk > 90 else 25.0, "process": "unknown_miner"})

            # Inject Recommendation if critical
            if rec:
                payload["recommendation"] = rec

            url = f"{BASE_URL}/{endpoint_suffix}"
            http.post(url, json=payload, headers=HEADERS)
            # print(f"[{domain}] Sent Risk {risk}: {label}")
            
        except Exception as e:
            print(f"[{domain}] Error: {e}")
            
        time.sleep(delay)
        
        # Advance story
        story_idx = (story_idx + 1) % len(story)
        
        # Reset session ID occasionally to simulate new attacks
        if story_idx == 0:
            session_id = f"{domain}_SIM_{uuid.uuid4().hex[:6].upper()}"
            time.sleep(1.0) # Gap between stories

if __name__ == "__main__":
    print("--- Starting Combined Attack Strategy Simulation ---")
    print("Simulating safe patterns with actionable recommendations...")
    
    threads = []
    
    # Map Domain to Endpoint Suffix
    mappings = [
        ("WEB", "http"),
        ("API", "api"),
        ("NETWORK", "network"),
        ("SYSTEM", "infra")
    ]
    
    for domain, suffix in mappings:
        t = threading.Thread(target=run_story, args=(domain, suffix))
        t.daemon = True
        t.start()
        threads.append(t)
        
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping simulation...")
