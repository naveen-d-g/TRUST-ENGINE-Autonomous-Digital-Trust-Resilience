import time
import argparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import requests

def provision_demo_account(url):
    """Ensures a demo account exists for the bot to use."""
    username = "visual_demo_bot"
    bot_email = f"{username}@target.local"
    bot_password = "demo_secure"
    
    # Base URL for Trust Engine API usually on 5000
    backend_url = "http://localhost:5000/api/v1/users/create"
    
    try:
        res = requests.post(backend_url, json={
            "email": bot_email,
            "user_id": username,
            "password": bot_password,
            "role": "viewer"
        }, timeout=2.0, headers={
            "X-API-Key": "dev-api-key", 
            "X-Role": "SYSTEM", 
            "X-Platform": "SECURITY_PLATFORM"
        })
        if res.status_code in [201, 409]:
            print(f"DEBUG: Demo account '{username}' ready.")
    except Exception as e:
        print(f"WARN: Could not verify demo account: {e}")
        
    return username, bot_password

def run_visual_demo(target_url):
    print("\n" + "="*50)
    print("🚀 TRUST ENGINE - VISUAL BOT DETECTION DEMO")
    print("="*50 + "\n")
    
    username, password = provision_demo_account(target_url)
    
    # Configure Chrome - Visible Mode for Demo
    chrome_options = Options()
    # We DON'T use --headless so the user can see the red cursor!
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--log-level=3") # Minimal console noise
    
    print("[*] Initializing Chrome Driver... (Checking for updates)")
    service = Service(ChromeDriverManager().install())
    
    print("[*] Launching Browser...")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        print(f"[*] Navigating to {target_url}...")
        driver.get(target_url.rstrip('/') + "/login")
        
        print(f"[*] Logging in as {username}...")
        driver.find_element(By.NAME, "username").send_keys(username)
        driver.find_element(By.NAME, "password").send_keys(password)
        
        # Click CAPTCHA (it's a simple checkbox in target app)
        try:
            captcha = driver.find_element(By.ID, "captcha")
            driver.execute_script("arguments[0].click();", captcha)
        except: pass
        
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(1)
        
        print("[*] Accessing Dashboard...")
        driver.get(target_url.rstrip('/') + "/dashboard")
        time.sleep(1)
        
        print("\n" + "!"*50)
        print("🤖 TRIGGERING ROBOTIC MOUSE SIMULATION...")
        print("WATCH THE BROWSER WINDOW FOR THE VIRTUAL CURSOR!")
        print("!"*50 + "\n")
        
        # Trigger the JS function I added to the Target App
        driver.execute_script("window.simulateBot();")
        
        # The simulation lasts 5 seconds + some buffer for sync
        start_wait = time.time()
        terminated = False
        
        while time.time() - start_wait < 15: # 15s timeout
            curr_url = driver.current_url
            if "force_password_reset" in curr_url:
                print("\n✅ DETECTION SUCCESSFUL!")
                print(f"🚩 Trust Engine detected robotic patterns and terminated session.")
                print(f"🚩 Current URL: {curr_url}")
                terminated = True
                break
            time.sleep(0.5)
            
        if not terminated:
            print("\n❌ DEMO TIMEOUT: Session was not terminated as expected.")
            
    except Exception as e:
        print(f"\n❌ ERROR during demo: {e}")
    finally:
        print("\n[*] Demo complete. Closing browser in 5 seconds...")
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trust Engine Visual Bot Demo Trigger")
    parser.add_argument("--url", default="http://localhost:3001", help="Target App Base URL")
    args = parser.parse_args()
    
    run_visual_demo(args.url)
