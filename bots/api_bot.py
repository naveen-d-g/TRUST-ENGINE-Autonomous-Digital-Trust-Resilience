import argparse
import time
import requests
import json
import random

def run_api_bot(endpoint, iterations, delay):
    login_url = endpoint.rstrip('/') + '/login'
    
    print(f"Starting API Requests Bot targeting {login_url}")
    print(f"Iterations: {iterations}, Delay: {delay}s")
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        # Intentionally missing JS fingerprint and typical browser headers
        "User-Agent": "python-requests/2.31.0"
    }

    success_count = 0
    fail_count = 0

    for i in range(iterations):
        # High request frequency, repeated credentials
        payload = {
            "username": f"bot_user_{random.randint(100, 999)}",
            "password": "bot_password"
        }
        
        try:
            start_time = time.time()
            # Send POST request
            response = requests.post(login_url, data=payload, headers=headers, allow_redirects=False)
            req_time = time.time() - start_time
            
            if response.status_code in [200, 302]:
                print(f"[{i+1}/{iterations}] Request success ({req_time:.2f}s) - Status: {response.status_code}")
                success_count += 1
            else:
                print(f"[{i+1}/{iterations}] Request failed ({req_time:.2f}s) - Status: {response.status_code}")
                fail_count += 1
                
        except Exception as e:
            print(f"[{i+1}/{iterations}] Error: {e}")
            fail_count += 1
            
        if delay > 0:
            time.sleep(delay)

    print("\nAPI Bot Run Summary:")
    print(f"Total Attempts: {iterations}")
    print(f"Successful: {success_count}")
    print(f"Failed/Blocked: {fail_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trust Engine - Target App API Bot")
    parser.add_argument("--url", type=str, default="http://localhost:3001/", help="Target Login URL")
    parser.add_argument("--count", type=int, default=10, help="Number of login attempts")
    parser.add_argument("--delay", type=float, default=0.05, help="Delay between requests in seconds")
    args = parser.parse_args()
    
    run_api_bot(args.url, args.count, args.delay)
