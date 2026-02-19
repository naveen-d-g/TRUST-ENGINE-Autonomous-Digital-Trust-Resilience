import time
import re
import os
import threading
from datetime import datetime
from backend.services.ingestion_service import IngestionService

class NginxAdapter:
    """
    Tails NGINX access logs and converts them to Security Events.
    Run run() in a separate thread.
    """
    
    # Combined Log Format Regex (Standard)
    # 127.0.0.1 - - [01/Feb/2026:10:00:00 +0000] "GET /path HTTP/1.1" 200 123 "referer" "user-agent"
    LOG_PATTERN = re.compile(
        r'(?P<ip>[\d\.]+) - - \[(?P<timestamp>.*?)\] "(?P<method>\w+) (?P<path>.*?) HTTP/.*?" (?P<status>\d+) (?P<bytes>\d+) "(?P<referer>.*?)" "(?P<ua>.*?)"'
    )

    def __init__(self, log_path="/var/log/nginx/access.log"):
        self.log_path = log_path
        self._stop_event = threading.Event()

    def start(self):
        """Starts the tailing thread."""
        thread = threading.Thread(target=self._tail_log, daemon=True)
        thread.start()
        print(f"[NginxAdapter] Monitoring started: {self.log_path}")

    def stop(self):
        self._stop_event.set()

    def _tail_log(self):
        # Open file. If not exists, wait.
        while not os.path.exists(self.log_path) and not self._stop_event.is_set():
            time.sleep(5)
            
        try:
            with open(self.log_path, 'r') as f:
                # Go to end of file
                f.seek(0, 2)
                
                while not self._stop_event.is_set():
                    line = f.readline()
                    if not line:
                        time.sleep(0.1)
                        continue
                        
                    self._process_line(line)
        except Exception as e:
            print(f"[NginxAdapter] Error tailing log: {e}")

    def _process_line(self, line):
        match = self.LOG_PATTERN.match(line)
        if not match:
            return # Malformed or non-matching line (e.g. error log mixed in)
            
        data = match.groupdict()
        
        # Parse timestamp (e.g. 01/Feb/2026:10:00:00 +0000)
        # For simplicity, we can trust system time or try to parse. 
        # Using ingestion service timestamp is safer for "arrival time".
        
        payload = {
            "method": data["method"],
            "path": data["path"],
            "status_code": int(data["status"]),
            "response_time_ms": 0, # Not in std combined log, usually request_time in custom format
            "payload_size": int(data["bytes"]),
            "user_agent": data["ua"],
            "ip_address": data["ip"],
            "referer": data["referer"]
        }
        
        IngestionService.ingest_http_event(payload)
