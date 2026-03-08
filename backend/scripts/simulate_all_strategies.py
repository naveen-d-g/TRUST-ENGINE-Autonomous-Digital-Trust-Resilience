
import requests
import time
import uuid
import random
import sys
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

# CONFIG
BASE_URL = "http://127.0.0.1:5000/api/v1/live/ingest"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "dev-api-key",
    "X-Platform": "USER_PLATFORM",
    "X-Role": "ADMIN"
}

# Robust Session with Retries
def get_session():
    s = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    s.mount('http://', HTTPAdapter(max_retries=retries))
    return s

# Domain Stories: (Delay, Risk, Label, Recommendation, ActorID)
STORIES = {
    "WEB": [ # Credential Stuffing (Step-Up Pattern)
        (3.0, 10, "Normal Page Visit", None, "anonymous"),
        (2.0, 20, "Login Page Load", None, "anonymous"),
        (2.0, 5, "Successful Login", None, "verified_user_777"),
        (3.0, 10, "Authenticated Dashboard Activity", None, "anonymous"), # Should stay linked to user_777
        (4.0, 60, "Brute Force Attempt Detected (IP)", "⚠️ Warning: Rate Limit Login & Check IP Reputation", "anonymous"),
        (5.0, 95, "Credential Stuffing Wave", "🛑 CRITICAL: Block IP Subnet & Enforce CAPTCHA", "anonymous"),
    ],
    "API": [ # Shadow API / Data Exfil (Bursty Spikes)
        (3.0, 15, "Standard API Calls", None, "anonymous"),
        (4.0, 95, "Shadow API Endpoint Access", "🚨 URGENT: Block Undocumented Endpoint & Audit Logs", "anonymous"),
        (3.0, 15, "Standard API Calls", None, "anonymous"),
        (5.0, 88, "Mass Data Export Attempt", "⚡ ACTION: Revoke API Key & Investigate Data Loss", "anonymous"),
    ],
    "NETWORK": [ # C2 Beaconing (Rhythmic/Oscillating)
        (3.5, 5, "Baseline Traffic", None, "anonymous"),
        (3.0, 45, "Unusual Outbound Packet", None, "anonymous"),
        (4.0, 75, "C2 Heartbeat Detected", "🛡️ Alert: Block C2 Domain & Inspect Host", "anonymous"),
    ],
    "SYSTEM": [ # Ransomware (Quiet then Critical Sustained)
        (3.0, 10, "Idle System", None, "anonymous"),
        (2.0, 80, "Suspicious PowerShell Script", "⚠️ Warning: Review PowerShell Execution Policy", "anonymous"),
        (8.0, 100, "Ransomware Encryption Activity", "☢️ EMERGENCY: Isolate Host, Kill Process & Restore Backup", "anonymous"),
    ]
}

def run_story(domain, endpoint_suffix):
    story = STORIES[domain]
    http = get_session()
    
    session_id = f"{domain}_SIM_{uuid.uuid4().hex[:6].upper()}"
    story_idx = 0
    
    print(f"[{domain}] Starting Simulation Story on Session {session_id}")
    
    while story_idx < len(story):
        delay, risk, label, rec, actor_id = story[story_idx]
        
        try:
            payload = {
                "session_id": session_id,
                "actor_id": actor_id,
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

            if rec:
                payload["recommendation"] = rec

            url = f"{BASE_URL}/{endpoint_suffix}"
            http.post(url, json=payload, headers=HEADERS)
            print(f"[{domain}] Sent Event: {label} (Actor: {actor_id}, Risk: {risk})")
            
        except Exception as e:
            print(f"[{domain}] Error: {e}")
            
        time.sleep(delay)
        
        # Enforcement check
        if risk >= 90:
            print(f"[{domain}] [CRITICAL] RISK ({risk}): Platform Enforcement Triggered. Terminating Session {session_id}.")
            time.sleep(1.0)
            break
        
        story_idx += 1

    print(f"[{domain}] Simulation finished for Session {session_id}")

if __name__ == "__main__":
    print("--- Starting Combined Attack Strategy Simulation (Low Level/Sequential) ---")
    
    # Map Domain to Endpoint Suffix
    mappings = [
        ("WEB", "http"),
        ("API", "api"),
        ("NETWORK", "network"),
        ("SYSTEM", "infra")
    ]
    
    for domain, suffix in mappings:
        print(f"\n--- Domain: {domain} ---")
        run_story(domain, suffix)
        time.sleep(2) # Pause between domains
        
    print("\nAll simulations completed.")
