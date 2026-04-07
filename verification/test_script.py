from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Serve local files directly
        page.goto("file:///app/dist/articles-and-resources.html")
        page.wait_for_selector('.fade-in')

        # Take screenshot of the blog articles
        page.screenshot(path="verification/blog_tags.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    main()
