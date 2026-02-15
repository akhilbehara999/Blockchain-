from playwright.sync_api import sync_playwright
import time

def verify_step5():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Inject state
        page.goto("http://localhost:5173/")
        page.evaluate("""
            localStorage.setItem('yupp_progress', JSON.stringify({
                currentStep: 5,
                completedSteps: [1,2,3,4],
                sandboxUnlocked: false
            }));
        """)

        # Navigate
        page.goto("http://localhost:5173/journey/5")

        # Verify title
        page.wait_for_selector("h1:has-text('The Lottery You Can\\'t Cheat')")
        print("Page loaded successfully")

        # Section 2: Manual Mining
        hash_btn = page.get_by_role("button", name="Hash It")
        for i in range(11): # do 11 to be safe
            page.fill("input[type=number]", str(i))
            hash_btn.click()

        print("Completed manual attempts")

        # Section 3: Computer Mining
        page.wait_for_selector("h2:has-text('Computer Mining')")
        print("Computer Mining section visible")

        start_mining_btn = page.get_by_role("button", name="Start Mining")
        start_mining_btn.click()
        page.wait_for_selector("text=BLOCK FOUND!", timeout=10000)
        print("Auto mining successful")

        # Section 4: Difficulty Experiment
        page.wait_for_selector("h2:has-text('Difficulty Experiment')")
        print("Difficulty Experiment section visible")

        # Difficulty 3
        page.get_by_role("button", name="Mine at Difficulty 3").click()
        # Wait for the result row for "3" to have "attempts" text (indicating success)
        # The row has text "3" and "Zeros". We look for "attempts" in that row?
        # Let's just wait a bit since it's fast (0.1s usually)
        time.sleep(1)

        # Difficulty 4
        page.fill("input[type=range]", "4")
        # Trigger change event if needed, but fill usually does it.
        # Wait for button text to update
        page.wait_for_selector("button:has-text('Mine at Difficulty 4')")
        page.get_by_role("button", name="Mine at Difficulty 4").click()

        # Wait for "Mining Race" header which appears after 2 difficulty experiments
        try:
            page.wait_for_selector("h2:has-text('Mining Race')", timeout=10000)
            print("Mining Race section visible")
        except:
             # If it failed, maybe the second difficulty didn't register? Try one more.
             print("Retrying difficulty...")
             page.fill("input[type=range]", "5")
             page.wait_for_selector("button:has-text('Mine at Difficulty 5')")
             page.get_by_role("button", name="Mine at Difficulty 5").click()
             page.wait_for_selector("h2:has-text('Mining Race')", timeout=10000)

        # Section 5: Mining Race
        page.get_by_role("button", name="Start Race").click()
        page.wait_for_selector("text=Won!", timeout=15000)
        print("Race completed")

        # Run race 2 more times to unlock completion
        page.get_by_role("button", name="Race Again").click()
        page.wait_for_selector("text=Racing...", state="detached") # wait for button to become clickable again? No, button text changes back to "Race Again"
        # Wait for "Race Again" to be clickable again implies race finished?
        # The button is disabled while racing.
        # So we wait for button to be enabled.
        # But verify script logic:
        # Click Race Again. Text becomes "Racing...". Wait for "Race Again" to reappear.
        # Actually "Race Again" stays "Race Again" if we use the same button? No, the text becomes "Racing..."
        # Wait for text "Race Again"

        # Wait for race 1 to finish (already done above)

        # Race 2
        page.get_by_role("button", name="Race Again").click()
        # Wait for result
        time.sleep(8) # A generous wait for simulation

        # Race 3
        page.get_by_role("button", name="Race Again").click()
        time.sleep(8)

        # Check for completion
        page.wait_for_selector("text=Step 5 Complete!", timeout=5000)
        print("Completion visible")

        page.screenshot(path="/home/jules/verification/step5_verification.png", full_page=True)
        print("Screenshot taken")

        browser.close()

if __name__ == "__main__":
    verify_step5()
