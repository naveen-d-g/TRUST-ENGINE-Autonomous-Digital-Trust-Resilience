from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time
import argparse

def run_selenium_bot(url, iterations):
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
    
    success_count = 0

    try:
        login_url = url.rstrip('/') + '/login'
        logout_url = url.rstrip('/') + '/logout'
        home_url = url.rstrip('/') + '/home'
        
        for i in range(iterations):
            start_time = time.time()
            bot_username = f"selenium_bot_{i}"
            
            # 1. Login Phase
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
            password_field.send_keys("automated_password")
            
            if not captcha_field.is_selected():
                driver.execute_script("arguments[0].click();", captcha_field)
                
            submit_button.click()
            
            # Give it a second to redirect to Dashboard/Home
            time.sleep(1)
            
            # 2. Form Submission Phase on Home Navigation Page
            driver.get(home_url)
            
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
            
            # Minimal delay
            time.sleep(0.5)
            
    except Exception as e:
         print(f"Bot stopped due to error: {e}")
    finally:
         driver.quit()
         print(f"\nSelenium Bot Run Summary:")
         print(f"Total Attempts: {iterations}")
         print(f"Successful Submissions: {success_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trust Engine - Target App Selenium Bot")
    parser.add_argument("--url", type=str, default="http://localhost:3001/", help="Target Login URL")
    parser.add_argument("--count", type=int, default=10, help="Number of login iterations")
    args = parser.parse_args()
    
    run_selenium_bot(args.url, args.count)
