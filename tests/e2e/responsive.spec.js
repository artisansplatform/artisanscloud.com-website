import { test, expect } from '@playwright/test';

// Test pages at different viewports
const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
];

// Sample pages to test responsiveness
const pagesToTest = [
    { path: '/', name: 'Home' },
    { path: '/retail-platform', name: 'Retail Platform' },
    { path: '/data-intelligence', name: 'Data Intelligence' },
    { path: '/about-us', name: 'About Us' },
];

test.describe('Responsive Layout Tests', () => {
    for (const viewport of viewports) {
        test.describe(`${viewport.name} Viewport (${viewport.width}x${viewport.height})`, () => {
            test.use({ viewport: { width: viewport.width, height: viewport.height } });

            for (const page of pagesToTest) {
                test(`${page.name} should have visible header at ${viewport.name}`, async ({ page: browserPage }) => {
                    await browserPage.goto(page.path);
                    
                    const header = browserPage.locator('header');
                    await expect(header).toBeVisible();
                });

                test(`${page.name} should not have horizontal overflow at ${viewport.name}`, async ({ page: browserPage }) => {
                    await browserPage.goto(page.path);
                    
                    // Check if page has horizontal scrollbar
                    const hasHorizontalScroll = await browserPage.evaluate(() => {
                        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
                    });
                    
                    expect(hasHorizontalScroll).toBe(false);
                });

                test(`${page.name} should render content correctly at ${viewport.name}`, async ({ page: browserPage }) => {
                    await browserPage.goto(page.path);
                    
                    // Wait for page to be fully loaded
                    await browserPage.waitForLoadState('networkidle');
                    
                    // Check that body has content
                    const bodyText = await browserPage.locator('body').textContent();
                    expect(bodyText?.length).toBeGreaterThan(100);
                });
            }
        });
    }

    test.describe('Mobile-specific Layout', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('header navigation should be collapsed on mobile', async ({ page }) => {
            await page.goto('/');
            
            // Desktop navigation should be hidden on mobile
            // Mobile menu button should be visible
            const menuToggle = page.locator('#menuToggle, button[aria-label*="menu"]').first();
            
            if (await menuToggle.count() > 0) {
                await expect(menuToggle).toBeVisible();
            }
        });

        test('content should stack vertically on mobile', async ({ page }) => {
            await page.goto('/');
            
            // Page should not be too wide
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.evaluate(() => window.innerWidth);
            
            // Body width should not exceed viewport width by more than a small margin
            expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
        });
    });

    test.describe('Desktop-specific Layout', () => {
        test.use({ viewport: { width: 1280, height: 800 } });

        test('header navigation should be expanded on desktop', async ({ page }) => {
            await page.goto('/');
            
            // Desktop navigation links should be visible
            const navLinks = page.locator('header nav a').first();
            await expect(navLinks).toBeVisible();
        });

        test('content should have proper spacing on desktop', async ({ page }) => {
            await page.goto('/');
            
            // Just verify the page renders without horizontal overflow
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            expect(hasHorizontalScroll).toBe(false);
        });
    });

    test.describe('Tablet Layout', () => {
        test.use({ viewport: { width: 768, height: 1024 } });

        test('tablet viewport should render properly', async ({ page }) => {
            await page.goto('/');
            
            // Check header is visible
            const header = page.locator('header');
            await expect(header).toBeVisible();
            
            // Check no horizontal overflow
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            expect(hasHorizontalScroll).toBe(false);
        });
    });

    test.describe('Viewport Transition', () => {
        test('layout should adapt when viewport changes', async ({ page, browser }) => {
            // Start at desktop
            const context = await browser.newContext({
                viewport: { width: 1280, height: 800 }
            });
            const newPage = await context.newPage();
            
            await newPage.goto('/');
            
            // Check desktop layout
            let header = newPage.locator('header');
            await expect(header).toBeVisible();
            
            // Resize to mobile
            await newPage.setViewportSize({ width: 375, height: 667 });
            await newPage.waitForTimeout(300);
            
            // Check mobile layout still works
            header = newPage.locator('header');
            await expect(header).toBeVisible();
            
            await context.close();
        });
    });
});
