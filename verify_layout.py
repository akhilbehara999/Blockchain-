import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Capture console logs
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # Wait for server to be ready
    base_url = "http://localhost:5173"
    print(f"Navigating to {base_url}")
    try:
        page.goto(base_url, timeout=30000)
    except Exception as e:
        print(f"Navigation failed: {e}")
        return

    # Take screenshot immediately to see what's loaded
    page.screenshot(path="debug_landing.png")
    print("Debug screenshot saved.")

    # 1. Verify Landing Page
    print("Verifying Landing Page...")
    try:
        page.wait_for_selector("text=BlockSim", timeout=5000)
        print("BlockSim text found.")
        page.screenshot(path="verification_landing.png")
    except:
        print("BlockSim text not found in 5s.")
        page.screenshot(path="failed_landing.png")
        browser.close()
        return

    # 2. Navigate to Introduction
    print("Navigating to Introduction...")
    try:
        page.click("text=Start Learning")
        page.wait_for_url(f"{base_url}/module/introduction")
        print("Navigated to Introduction.")
    except Exception as e:
        print(f"Navigation to intro failed: {e}")
        page.screenshot(path="failed_nav.png")
        browser.close()
        return

    # 3. Verify Layout
    print("Verifying Layout...")
    try:
        page.wait_for_selector("aside") # Sidebar
        page.wait_for_selector("header") # TopBar
        print("Layout elements found.")
        page.screenshot(path="verification_module.png")
    except:
        print("Layout elements missing.")
        page.screenshot(path="failed_module.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
