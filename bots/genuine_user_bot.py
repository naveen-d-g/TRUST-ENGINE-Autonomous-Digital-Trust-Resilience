import argparse
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def simulate_typing(element, text, min_delay=0.05, max_delay=0.2):
    """Simulates human typing with random delays."""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(min_delay, max_delay))

def run_genuine_user_bot(url, headless=True):
    print(f"Starting Genuine User Simulation targeting {url}")
    print("This bot mimics human pacing and behavior to generate a high Trust Score.")
    
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        login_url = url.rstrip('/') + '/login'
        home_url = url.rstrip('/') + '/home'
        dashboard_url = url.rstrip('/') + '/dashboard'
        logout_url = url.rstrip('/') + '/logout'
        
        # Ensure clean state
        driver.get(logout_url)
        time.sleep(1)
        
        # 1. Navigation to Login
        print("[Scenario 1] Navigating to login page...")
        driver.get(login_url)
        
        # Human reading time
        time.sleep(random.uniform(1.5, 3.0))
        
        username_field = driver.find_element(By.NAME, "username")
        password_field = driver.find_element(By.NAME, "password")
        captcha_field = driver.find_element(By.ID, "captcha")
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        # 2. Typing Credentials (Slowly)
        print("[Scenario 2] Entering credentials at human speed...")
        username_field.clear()
        simulate_typing(username_field, "demo_user")
        time.sleep(random.uniform(0.5, 1.2)) # Pause between fields
        
        password_field.clear()
        simulate_typing(password_field, "demo_secure")
        time.sleep(random.uniform(0.8, 1.5))
        
        # 3. Interacting with Captcha
        print("[Scenario 3] Passing human verification (Captcha)...")
        if not captcha_field.is_selected():
            driver.execute_script("arguments[0].click();", captcha_field)
            
        time.sleep(random.uniform(0.5, 1.0))
        
        # Submit Login
        print("Submitting login form...")
        submit_button.click()
        
        # Wait for redirect
        WebDriverWait(driver, 5).until(EC.url_contains("/home"))
        print("Login successful.")
        
        # 4. Browsing Home Page
        print("[Scenario 4] Browsing home page and reading content...")
        time.sleep(random.uniform(4.0, 7.0)) # Reading the page
        
        # 5. Form Submission (Normal Payload)
        print("[Scenario 5] Submitting normal business data...")
        data_field = driver.find_element(By.NAME, "data_field")
        save_button = driver.find_element(By.CSS_SELECTOR, "button.submit")
        
        simulate_typing(data_field, "Q3 Financial Report Summary - Confidential", min_delay=0.02, max_delay=0.1)
        time.sleep(random.uniform(0.5, 1.5))
        
        save_button.click()
        print("Data saved successfully.")
        
        # 6. Navigating to Dashboard
        print("[Scenario 6] Navigating to internal dashboard...")
        time.sleep(random.uniform(2.0, 4.0))
        driver.get(dashboard_url)
        
        # Spend time on dashboard
        time.sleep(random.uniform(5.0, 8.0))
        
        # 7. Logging out gracefully
        print("[Scenario 7] Logging out gracefully...")
        driver.get(logout_url)
        print("Simulation complete. User has logged out.")
        
        print("\n=== TEST RESULTS ===")
        print("Run successful. You should see a new session in the Session Explorer")
        print("with a HIGH Trust Score (e.g., >95) and a Final Decision of 'ALLOW'.")
        print("No critical alerts or SOC popups should have been triggered.")

    except Exception as e:
        print(f"Simulation stopped due to error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trust Engine - Genuine User Simulation")
    parser.add_argument("--url", type=str, default="http://localhost:3001/", help="Target App URL")
    parser.add_argument("--visible", action="store_true", help="Run Chrome visibly instead of headless")
    args = parser.parse_args()
    
    run_genuine_user_bot(args.url, headless=not args.visible)
