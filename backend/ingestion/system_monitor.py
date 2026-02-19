import time
import socket
import requests
import json
import os

try:
    import psutil
except ImportError:
    print("psutil not found. Please install it: pip install psutil")
    exit(1)

API_KEY = "dev-api-key" 
API_URL = "http://localhost:5000/api/v1/ingest/system"

def send_event(payload):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
        "X-Platform": "SECURITY_PLATFORM",
        "X-Role": "ADMIN"
    }
    try:
        response = requests.post(API_URL, json=payload, headers=headers, timeout=2)
        if response.status_code != 200:
            print(f"[ERROR] Failed to send system event: {response.text}")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")

def monitor():
    hostname = socket.gethostname()
    print(f"Starting System Monitor on {hostname}...")
    
    while True:
        try:
            # interval=1 blocks for 1 second to calculate CPU
            cpu = psutil.cpu_percent(interval=5)
            mem = psutil.virtual_memory().percent
            
            # Disk usage (Platform independent mostly, usually '/' or 'C:')
            disk = 0.0
            try:
                disk = psutil.disk_usage(os.path.abspath(os.sep)).percent
            except:
                pass

            event = {
                "domain": "SYSTEM",
                "event_type": "SYSTEM_METRIC",
                "actor_type": "SYSTEM",
                "actor_id": hostname,
                "payload": {
                    "cpu_usage": cpu,
                    "memory_usage": mem,
                    "disk_usage": disk,
                    "timestamp_raw": time.time()
                }
            }
            send_event(event)
            # Loop delay is inside cpu_percent interval if set, but we set it to 5 above.
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error in monitor loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    monitor()
