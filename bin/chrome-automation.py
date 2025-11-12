#!/usr/bin/env python3
"""
Chrome Automation without MCP
Full control of Chrome using Selenium
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class ChromeController:
    def __init__(self, headless=False):
        """Initialize Chrome with or without display"""
        self.options = Options()

        if headless:
            self.options.add_argument('--headless')
        else:
            # Use virtual display :99
            import os
            os.environ['DISPLAY'] = ':99'

        # Common options
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument('--disable-gpu')
        self.options.add_argument('--window-size=1920,1080')

        # Connect to existing Chrome OR create new one
        self.options.add_experimental_option("debuggerAddress", "localhost:9222")

        try:
            # Try to connect to existing Chrome
            self.driver = webdriver.Chrome(options=self.options)
            print("✓ Connected to existing Chrome")
        except:
            # Create new Chrome instance
            self.options = Options()
            if headless:
                self.options.add_argument('--headless')
            self.options.add_argument('--no-sandbox')
            self.options.add_argument('--disable-dev-shm-usage')
            self.driver = webdriver.Chrome(options=self.options)
            print("✓ Created new Chrome instance")

    def navigate(self, url):
        """Navigate to URL"""
        self.driver.get(url)
        print(f"✓ Navigated to: {url}")
        return self.driver.title

    def search_google(self, query):
        """Search on Google"""
        self.navigate("https://www.google.com")
        search_box = self.driver.find_element(By.NAME, "q")
        search_box.send_keys(query)
        search_box.send_keys(Keys.RETURN)
        time.sleep(2)
        results = self.driver.find_elements(By.CSS_SELECTOR, "h3")
        return [r.text for r in results[:5]]

    def screenshot(self, filename="screenshot.png"):
        """Take a screenshot"""
        self.driver.save_screenshot(f"/tmp/{filename}")
        print(f"✓ Screenshot saved: /tmp/{filename}")

    def click_element(self, selector):
        """Click an element"""
        element = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
        )
        element.click()
        print(f"✓ Clicked: {selector}")

    def fill_form(self, selector, text):
        """Fill a form field"""
        element = self.driver.find_element(By.CSS_SELECTOR, selector)
        element.clear()
        element.send_keys(text)
        print(f"✓ Filled: {selector}")

    def get_text(self, selector):
        """Get text from element"""
        element = self.driver.find_element(By.CSS_SELECTOR, selector)
        return element.text

    def execute_js(self, script):
        """Execute JavaScript"""
        return self.driver.execute_script(script)

    def close(self):
        """Close the browser"""
        self.driver.quit()
        print("✓ Browser closed")

# Example usage
if __name__ == "__main__":
    # Choose mode
    mode = sys.argv[1] if len(sys.argv) > 1 else "visible"

    if mode == "headless":
        print("Running in HEADLESS mode (no display)")
        chrome = ChromeController(headless=True)
    else:
        print("Running in VISIBLE mode (check NoVNC)")
        chrome = ChromeController(headless=False)

    # Demo actions
    print("\n=== Chrome Automation Demo ===\n")

    # Navigate to Google
    title = chrome.navigate("https://www.google.com")
    print(f"Page title: {title}")

    # Search for something
    print("\nSearching for 'Python selenium'...")
    results = chrome.search_google("Python selenium")
    print("Top results:")
    for i, result in enumerate(results, 1):
        print(f"  {i}. {result}")

    # Take screenshot
    chrome.screenshot("google_search.png")

    # Navigate to another site
    chrome.navigate("https://example.com")

    # Get page text
    text = chrome.get_text("h1")
    print(f"\nPage heading: {text}")

    # Execute JavaScript
    url = chrome.execute_js("return window.location.href")
    print(f"Current URL via JS: {url}")

    print("\n✅ Demo complete!")
    print("Browser stays open for viewing in NoVNC")
    print("To close: run 'pkill -f chrome'")