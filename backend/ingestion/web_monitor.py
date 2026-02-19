import time
import re
import json
import requests
import os
import sys
from datetime import datetime

# Configuration
LOG_FILE_PATH = os.environ.get("NGINX_LOG_PATH", "access.log")
API_URL = "http://localhost:5000/api/v1/ingest/web"
API_KEY = "dev-api-key"

# Regex for Nginx common log format
# 127.0.0.1 - - [10/Feb/2026:12:00:01 +0000] "POST /login HTTP/1.1" 401 324 "-" "Mozilla/5.0"
LOG_PATTERN = re.compile(r'^(\S+) \S+ \S+ \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"')

def parse_line(line):
    match = LOG_PATTERN.match(line)
    if not match:
        return None
    
    ip = match.group(1)
    timestamp_str = match.group(2)
    request_str = match.group(3)
    status_code = int(match.group(4))
    size = int(match.group(5))
    referer = match.group(6)
    user_agent = match.group(7)
    
    # Parse Request: "METHOD /path HTTP/1.1"
    parts = request_str.split()
    method = parts[0] if len(parts) > 0 else "UNKNOWN"
    path = parts[1] if len(parts) > 1 else "/"
    
    return {
        "domain": "WEB",
        "event_type": "HTTP_REQUEST",
        "actor_type": "IP",
        "actor_id": ip,
        "payload": {
            "method": method,
            "path": path,
            "status_code": status_code,
            "response_size_bytes": size,
            "user_agent": user_agent,
            "referer": referer,
            "timestamp_raw": timestamp_str
        }
    }

def send_event(event):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
        "X-Platform": "SECURITY_PLATFORM",
        "X-Role": "ADMIN"
    }
    try:
        response = requests.post(API_URL, json=event, headers=headers, timeout=2)
        if response.status_code != 200:
            print(f"[ERROR] Failed to send event: {response.text}")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")

def tail_log(filepath):
    # Ensure file exists
    if not os.path.exists(filepath):
        print(f"[INFO] Waiting for log file: {filepath}")
        while not os.path.exists(filepath):
            time.sleep(1)
            
    print(f"[INFO] Tailing log file: {filepath}")
    
    with open(filepath, "r") as f:
        # Seek to end
        f.seek(0, 2)
        
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.1)
                continue
                
            event = parse_line(line)
            if event:
                send_event(event)

if __name__ == "__main__":
    print(f"Starting Web Monitor... watching {LOG_FILE_PATH}")
    tail_log(LOG_FILE_PATH)
