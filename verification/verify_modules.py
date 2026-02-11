from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Base URL (vite usually starts on 5173)
    base_url = "http://localhost:5173"

    try:
        print("Verifying Keys...")
        page.goto(f"{base_url}/module/keys")
        # Wait for something specific to the new module
        page.wait_for_selector("text=Public Key", timeout=10000)
        page.screenshot(path="verification/keys.png")
        print("Keys screenshot taken")

        print("Verifying Transaction...")
        page.goto(f"{base_url}/module/transaction")
        page.wait_for_selector("text=Sending Value", timeout=10000)
        page.screenshot(path="verification/transaction.png")
        print("Transaction screenshot taken")

        print("Verifying Coinbase...")
        page.goto(f"{base_url}/module/coinbase")
        page.wait_for_selector("text=Coinbase Transaction", timeout=10000)
        page.screenshot(path="verification/coinbase.png")
        print("Coinbase screenshot taken")

        print("Verifying Difficulty...")
        page.goto(f"{base_url}/module/difficulty")
        page.wait_for_selector("text=Mining Difficulty", timeout=10000)
        page.screenshot(path="verification/difficulty.png")
        print("Difficulty screenshot taken")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
