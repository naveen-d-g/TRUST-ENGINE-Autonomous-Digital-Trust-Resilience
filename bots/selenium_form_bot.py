from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
import time
import argparse
import random
from selenium.common.exceptions import NoSuchElementException
import requests

def provision_bot_account(username):
    """Ensures the Target App bot account exists in the Trust Engine backend."""
    bot_email = f"{username}@target.local"
    bot_password = "bot_secure"
    
    try:
        # Check if exists by trying to create
        res = requests.post("http://localhost:5000/api/v1/users/create", json={
            "email": bot_email,
            "user_id": username,
            "password": bot_password,
            "role": "viewer"
        }, timeout=2.0, headers={"X-API-Key": "dev-api-key", "X-Role": "SYSTEM", "X-Platform": "SECURITY_PLATFORM"})
        
        if res.status_code in [200, 201, 400, 409]:
            pass # created or exists
    except Exception as e:
        print(f"Failed to check/provision bot account on backend: {e}")
        
    return username, bot_password

def simulate_robotic_mouse(driver):
    """
    Moves the mouse in a perfectly linear, robotic pattern with consistent 5ms intervals.
    """
    actions = ActionChains(driver)
    
    # Reset to a known safe spot if possible, or just start from current which defaults to 0,0 locally
    # We'll track our virtual position to avoid bounds errors
    curr_x, curr_y = 0, 0
    window_w, window_h = 1920, 1080
    
    print("Executing robotic mouse pattern (Linear, Fixed Interval)...")
    
    # 3 linear segments
    for _ in range(3):
        # Pick a target ABSOLUTE coordinate
        target_x = random.randint(100, window_w - 100)
        target_y = random.randint(100, window_h - 100)
        
        # Calculate delta from current position
        dx = target_x - curr_x
        dy = target_y - curr_y
        
        # Move in small, perfectly consistent steps
        steps = 25
        for s in range(steps):
            step_x = int(dx / steps)
            step_y = int(dy / steps)
            
            try:
                actions.move_by_offset(step_x, step_y).perform()
                curr_x += step_x
                curr_y += step_y
                time.sleep(0.005)
            except Exception:
                # If we still hit a bound, just break this segment
                break

def run_selenium_bot(url, iterations, custom_username=None, custom_password=None):
    print(f"Starting Unified Selenium Bot (Mouse + Form) targeting {url}")
    print(f"Iterations: {iterations}")
    
    # Configure Headless Chrome
    chrome_options = Options()
    # Note: Headless mode can be detected by some rules, but and robotic mouse is more reliable for ML features
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    if custom_username and custom_password:
        print(f"Using provided user credentials: {custom_username}")
    
    success_count = 0

    try:
        login_url = url.rstrip('/') + '/login'
        logout_url = url.rstrip('/') + '/logout'
        home_url = url.rstrip('/') + '/home'
        
        for i in range(iterations):
            start_time = time.time()
            
            if custom_username and custom_password:
                bot_username, bot_password = custom_username, custom_password
            else:
                bot_username, bot_password = provision_bot_account(f"selenium_bot_{i}")
                
            print(f"[{i+1}/{iterations}] Logging in as {bot_username}...")
            driver.get(logout_url)
            
            # Simulate initial robotic mouse movement upon landing
            simulate_robotic_mouse(driver)
            
            username_field = driver.find_element(By.NAME, "username")
            password_field = driver.find_element(By.NAME, "password")
            captcha_field = driver.find_element(By.ID, "captcha")
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            
            username_field.clear()
            username_field.send_keys(bot_username)
            password_field.clear()
            password_field.send_keys(bot_password)
            
            if not captcha_field.is_selected():
                driver.execute_script("arguments[0].click();", captcha_field)
            
            # Simulate movement before click
            simulate_robotic_mouse(driver)
            submit_button.click()
            
            time.sleep(1)
            
            try:
                # 1. Home Form Interaction
                driver.get(home_url)
                simulate_robotic_mouse(driver)
                
                try:
                    data_field = driver.find_element(By.NAME, "data_field")
                    save_button = driver.find_element(By.CSS_SELECTOR, "button.submit")
                    data_field.clear()
                    data_field.send_keys(f"automated_scraping_payload_{i}")
                    save_button.click()
                    print(f"[{i+1}/{iterations}] Home Form Submitted.")
                except NoSuchElementException:
                    print(f"[{i+1}/{iterations}] Home Form elements not found. Checking for block...")

                # 2. Dashboard Interaction
                dashboard_url = url.rstrip('/') + '/dashboard'
                print(f"[{i+1}/{iterations}] Navigating to Dashboard...")
                driver.get(dashboard_url)
                simulate_robotic_mouse(driver)

                try:
                    # Trigger Generic API Call
                    api_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Trigger API Call')]")
                    api_btn.click()
                    time.sleep(1)

                    # Trigger Internal Bot Simulation JS (Behavioral Telemetry Check)
                    bot_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Simulate Bot Interaction')]")
                    bot_btn.click()
                    time.sleep(2) 
                    
                    print(f"[{i+1}/{iterations}] Dashboard Telemetry Triggered.")
                except NoSuchElementException:
                    print(f"[{i+1}/{iterations}] Dashboard interaction elements missing.")

                success_count += 1

            except NoSuchElementException:
                # This outer catch handles cases where the page itself didn't load or major redirect occurred
                current_url = driver.current_url
                if "login" in current_url.lower() or "reset" in current_url.lower():
                    print(f"[{i+1}/{iterations}] Bot blocked or Terminated! Redirected to: {current_url}")
                    print(f"[{i+1}/{iterations}] Trust Engine likely triggered session revocation.")
                else:
                    print(f"[{i+1}/{iterations}] Unexpected navigation or missing element at: {current_url}")
            
            time.sleep(0.5)
            
    except Exception as e:
         print(f"Bot stopped due to error: {e}")
    finally:
         driver.quit()
         print(f"\nUnified Bot Run Summary:")
         print(f"Total Attempts: {iterations}")
         print(f"Form Submissions: {success_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trust Engine - Target App Selenium Bot")
    parser.add_argument("--url", type=str, default="http://localhost:3001/", help="Target Login URL")
    parser.add_argument("--count", type=int, default=5, help="Number of login iterations")
    parser.add_argument("--username", type=str, help="Custom username (e.g., viewer@view)")
    parser.add_argument("--password", type=str, help="Custom password (e.g., asdfghjkl)")
    args = parser.parse_args()
    
    run_selenium_bot(args.url, args.count, args.username, args.password)
