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
API_URL = "http://localhost:5000/api/v1/ingest/network"

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
            print(f"[ERROR] Failed to send network event: {response.text}")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")

def monitor():
    hostname = socket.gethostname()
    print(f"Starting Network Monitor on {hostname}...")
    
    known_ports = set()
    first_run = True
    
    while True:
        try:
            # Capture active connections (requires permissions for some details, but basic works)
            conns = psutil.net_connections(kind='inet')
            listening_ports = [c.laddr.port for c in conns if c.status == 'LISTEN']
            established = [c for c in conns if c.status == 'ESTABLISHED']
            
            current_ports = set(listening_ports)
            
            if not first_run:
                new_ports = current_ports - known_ports
                if new_ports:
                     event = {
                        "domain": "NETWORK",
                        "event_type": "PORT_OPENED",
                        "actor_type": "SYSTEM",
                        "actor_id": hostname,
                        "payload": {
                            "ports": list(new_ports),
                            "total_listening": len(listening_ports),
                            "timestamp_raw": time.time()
                        }
                     }
                     send_event(event)
            else:
                known_ports = current_ports
                first_run = False

            known_ports = current_ports
            
            # Connection summary stats
            remote_ips = set()
            for c in established:
                if c.raddr:
                    try:
                        remote_ips.add(c.raddr.ip)
                    except:
                        pass # raddr might be a tuple or namedtuple
            
            # Periodic heartbeat event
            event = {
                "domain": "NETWORK",
                "event_type": "NETWORK_STATE",
                "actor_type": "SYSTEM",
                "actor_id": hostname,
                "payload": {
                    "listening_ports_count": len(listening_ports),
                    "established_connections": len(established),
                    "unique_remote_ips": list(remote_ips)[:10], # Sample
                    "timestamp_raw": time.time()
                }
            }
            send_event(event)
            
            time.sleep(5)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error in monitor loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    monitor()
