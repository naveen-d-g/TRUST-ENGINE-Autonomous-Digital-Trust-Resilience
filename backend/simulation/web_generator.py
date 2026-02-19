import logging
import random
import time
import os
from datetime import datetime
import sys

# Configure where to write logs
LOG_FILE_PATH = os.environ.get("NGINX_LOG_PATH", "access.log")

# Setup logger to write to file without formatting (we format manually)
logger = logging.getLogger("nginx_simulator")
logger.setLevel(logging.INFO)
handler = logging.FileHandler(LOG_FILE_PATH)
handler.setFormatter(logging.Formatter("%(message)s"))
logger.addHandler(handler)

# Sample Data
IPS = ["192.168.1.10", "10.0.0.5", "172.16.0.23", "8.8.8.8", "127.0.0.1"]
PATHS = ["/login", "/dashboard", "/api/v1/users", "/api/v1/incidents", "/static/css/main.css", "/admin", "/wp-admin.php"]
METHODS = ["GET", "POST", "PUT", "DELETE", "HEAD"]
STATUS_CODES = [200, 201, 301, 302, 400, 401, 403, 404, 500]
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "curl/7.68.0",
    "python-requests/2.25.1"
]

def generate_log_line():
    ip = random.choice(IPS)
    # Format: [10/Feb/2026:12:00:01 +0000]
    now = datetime.utcnow().strftime("%d/%b/%Y:%H:%M:%S +0000")
    method = random.choice(METHODS)
    path = random.choice(PATHS)
    protocol = "HTTP/1.1"
    status = random.choice(STATUS_CODES)
    size = random.randint(100, 5000)
    referer = "-"
    ua = random.choice(USER_AGENTS)
    
    # Simulate some logic
    if path == "/login" and method == "POST":
        if random.random() < 0.2: status = 401 # Failed login
        else: status = 200
    if path == "/wp-admin.php": status = 404 # Scan attempt
    
    # Nginx Format
    # 127.0.0.1 - - [10/Feb/2026:12:00:01 +0000] "POST /login HTTP/1.1" 401 324 "-" "Mozilla/5.0"
    log_line = f'{ip} - - [{now}] "{method} {path} {protocol}" {status} {size} "{referer}" "{ua}"'
    return log_line

def run_simulation():
    print(f"Starting Nginx Traffic Simulation... writing to {LOG_FILE_PATH}")
    try:
        while True:
            line = generate_log_line()
            logger.info(line)
            # print(f"Wrote: {line}")
            time.sleep(random.uniform(0.1, 1.0))
    except KeyboardInterrupt:
        print("\nStopping simulation.")

if __name__ == "__main__":
    run_simulation()
