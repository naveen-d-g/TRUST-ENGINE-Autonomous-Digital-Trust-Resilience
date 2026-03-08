from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import argparse
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

def run_selenium_bot(url, iterations, custom_username=None, custom_password=None):
    print(f"Starting Selenium Form Bot targeting {url}")
    print(f"Iterations: {iterations}")
    
    # Configure Headless Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    # Same user-agent for consistency
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Initialize WebDriver
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
            
            # 1. Login Phase
            if custom_username and custom_password:
                bot_username, bot_password = custom_username, custom_password
            else:
                bot_username, bot_password = provision_bot_account(f"selenium_bot_{i}")
                
            print(f"[{i+1}/{iterations}] Logging in as {bot_username}...")
            # Go to logout first to ensure a clean session
            driver.get(logout_url)
            
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
                
            submit_button.click()
            
            # Give it a second to redirect to Dashboard/Home
            time.sleep(1)
            
            # 2. Form Submission Phase on Home Navigation Page
            driver.get(home_url)
            
            try:
                # Find the new data form
                data_field = driver.find_element(By.NAME, "data_field")
                save_button = driver.find_element(By.CSS_SELECTOR, "button.submit")
                
                # Fill out dummy data
                data_field.clear()
                data_field.send_keys(f"automated_scraping_payload_{i}")
                
                # Submit form
                save_button.click()
                
                req_time = time.time() - start_time
                print(f"[{i+1}/{iterations}] Dashboard Form Submitted by {bot_username} in {req_time:.3f}s")
                success_count += 1
            except NoSuchElementException:
                # If we can't find the field, it's likely we were blocked and redirected
                current_url = driver.current_url
                print(f"[{i+1}/{iterations}] Bot blocked! Redirected to: {current_url}")
                print(f"[{i+1}/{iterations}] The Trust Engine terminated the session.")
            
            # Minimal delay
            time.sleep(0.5)
            
    except Exception as e:
         print(f"Bot stopped due to error: {e}")
    finally:
         driver.quit()
         print(f"\nSelenium Bot Run Summary:")
         print(f"Total Attempts: {iterations}")
         print(f"Form Submissions: {success_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trust Engine - Compromised Account Bot")
    parser.add_argument("--url", type=str, default="http://localhost:3001/", help="Target Login URL")
    parser.add_argument("--count", type=int, default=3, help="Number of login iterations")
    parser.add_argument("--username", type=str, default="viewer@view", help="Compromised username")
    parser.add_argument("--password", type=str, default="asdfghjkl", help="Compromised password")
    args = parser.parse_args()
    
    run_selenium_bot(args.url, args.count, args.username, args.password)
