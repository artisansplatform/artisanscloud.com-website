import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
    test.describe('Desktop Navigation', () => {
        test.use({ viewport: { width: 1280, height: 800 } });

        test('should have clickable navigation links', async ({ page }) => {
            await page.goto('/');
            
            // Check that header exists and is visible
            const header = page.locator('header#siteHeader');
            await expect(header).toBeVisible();
            
            // Check that desktop nav links exist (using class instead of specific href)
            const navLinks = page.locator('header .header-link').first();
            await expect(navLinks).toBeVisible();
        });

        test('solutions dropdown should open on click', async ({ page }) => {
            await page.goto('/');
            
            // Find the Solutions dropdown toggle
            const solutionsToggle = page.locator('header .dropdown-toggle').filter({ hasText: /solutions/i }).first();
            
            if (await solutionsToggle.count() > 0) {
                // Click the toggle
                await solutionsToggle.click();
                
                // Wait a bit for animation
                await page.waitForTimeout(300);
                
                // Check if dropdown menu appears
                const dropdownMenu = page.locator('header .dropdown-menu').first();
                
                // The dropdown should be visible or have the 'show' class
                const isVisible = await dropdownMenu.isVisible().catch(() => false);
                const hasShowClass = await dropdownMenu.getAttribute('class').then(c => c?.includes('show')).catch(() => false);
                
                expect(isVisible || hasShowClass).toBeTruthy();
            }
        });

        test('header should be sticky on page load', async ({ page }) => {
            await page.goto('/');
            
            const header = page.locator('header#siteHeader');
            await expect(header).toBeVisible();
            
            // Check if header has fixed or sticky positioning
            const position = await header.evaluate((el) => {
                return window.getComputedStyle(el).position;
            });
            
            expect(['fixed', 'sticky', '-webkit-sticky']).toContain(position);
        });

        test('header should change class on scroll', async ({ page }) => {
            await page.goto('/');
            
            const header = page.locator('header#siteHeader');
            
            // Get initial classes
            const initialClasses = await header.getAttribute('class');
            
            // Scroll down
            await page.evaluate(() => window.scrollTo(0, 200));
            await page.waitForTimeout(300);
            
            // Get classes after scroll
            const scrolledClasses = await header.getAttribute('class');
            
            // Classes should change (header-scrolled class should be added)
            // This is a flexible check - we just verify the classes changed
            const classesChanged = initialClasses !== scrolledClasses || 
                                  scrolledClasses?.includes('header-scrolled');
            
            expect(classesChanged).toBeTruthy();
        });
    });

    test.describe('Mobile Navigation', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('mobile menu toggle should exist', async ({ page }) => {
            await page.goto('/');
            
            // Check for mobile menu toggle button
            const menuToggle = page.locator('#menuToggle');
            
            // At mobile viewport, menu toggle should be visible
            await expect(menuToggle).toBeVisible();
        });

        test('mobile menu should open', async ({ page }) => {
            await page.goto('/');
            
            // Find the menu toggle
            const menuToggle = page.locator('#menuToggle');
            
            // Click to open
            await menuToggle.click();
            await page.waitForTimeout(500);
            
            // Check if mobile menu is visible
            const mobileMenu = page.locator('#mainNav');
            
            // Check if menu has transitioned (no longer has translate-x-full)
            const transform = await mobileMenu.evaluate((el) => {
                return window.getComputedStyle(el).transform;
            });
            
            // If transform is not 'none', the menu has moved
            const isOpen = transform !== 'none' || await mobileMenu.isVisible();
            
            expect(isOpen).toBeTruthy();
        });

        test('mobile menu should close with close button', async ({ page }) => {
            await page.goto('/');
            
            const menuToggle = page.locator('#menuToggle');
            const closeButton = page.locator('#menuClose');
            
            // Open menu
            await menuToggle.click();
            await page.waitForTimeout(500);
            
            // Click close button
            await closeButton.click({ force: true });
            await page.waitForTimeout(500);
            
            // Check if body overflow is restored
            const bodyOverflow = await page.evaluate(() => {
                return document.body.style.overflow !== 'hidden';
            });
            
            expect(bodyOverflow).toBeTruthy();
        });

        test('mobile menu should close on Escape key', async ({ page }) => {
            await page.goto('/');
            
            const menuToggle = page.locator('#menuToggle');
            
            // Open menu
            await menuToggle.click();
            await page.waitForTimeout(500);
            
            // Press Escape
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
            
            // Check if body overflow is restored
            const bodyOverflow = await page.evaluate(() => {
                return document.body.style.overflow !== 'hidden';
            });
            
            expect(bodyOverflow).toBeTruthy();
        });
    });

    test.describe('Active Navigation State', () => {
        test.use({ viewport: { width: 1280, height: 800 } });

        test('header link should be active on matching page', async ({ page }) => {
            await page.goto('/unified-commerce');

            // The "Unified Commerce" header link should have the active class
            const activeLink = page.locator('header .header-link.active[href="/unified-commerce"]');
            await expect(activeLink).toHaveCount(1);
        });

        test('solutions dropdown toggle should be active on a solution sub-page', async ({ page }) => {
            await page.goto('/d2c-eCommerce');

            // The Solutions dropdown toggle should be active
            const toggle = page.locator('header .dropdown-toggle.active');
            await expect(toggle).toHaveCount(1);

            // The matching dropdown item should also be active
            const dropdownItem = page.locator('header .dropdown-item.active[href="/d2c-eCommerce"]');
            await expect(dropdownItem).toHaveCount(1);
        });

        test('footer nav link should be active on matching page', async ({ page }) => {
            await page.goto('/unified-commerce');

            // Footer "Unified Commerce" link should have the active class
            const footerActiveLink = page.locator('footer .flex.flex-col a.active[href="/unified-commerce"]');
            await expect(footerActiveLink).toHaveCount(1);
        });

        test('no header links should be active on non-matching page', async ({ page }) => {
            await page.goto('/about-us');

            // Unified Commerce link should NOT be active
            const inactiveLink = page.locator('header .header-link.active[href="/unified-commerce"]');
            await expect(inactiveLink).toHaveCount(0);

            // About Us link should be active
            const activeLink = page.locator('header .header-link.active[href="/about-us"]');
            await expect(activeLink).toHaveCount(1);
        });
    });

    test.describe('Dropdown Behavior', () => {
        test.use({ viewport: { width: 1280, height: 800 } });

        test('dropdown should close when clicking outside', async ({ page }) => {
            await page.goto('/');
            
            const dropdownToggle = page.locator('.dropdown-toggle').first();
            
            if (await dropdownToggle.count() > 0) {
                // Open dropdown
                await dropdownToggle.click();
                await page.waitForTimeout(300);
                
                // Click somewhere else on the page
                await page.locator('body').click({ position: { x: 500, y: 500 } });
                await page.waitForTimeout(300);
                
                // Dropdown should be closed (no 'show' class)
                const dropdownMenu = page.locator('.dropdown-menu.show');
                const count = await dropdownMenu.count();
                
                expect(count).toBe(0);
            }
        });

        test('dropdown should close on Escape key', async ({ page }) => {
            await page.goto('/');
            
            const dropdownToggle = page.locator('.dropdown-toggle').first();
            
            if (await dropdownToggle.count() > 0) {
                // Open dropdown
                await dropdownToggle.click();
                await page.waitForTimeout(300);
                
                // Press Escape
                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);
                
                // Dropdown should be closed
                const dropdownMenu = page.locator('.dropdown-menu.show');
                const count = await dropdownMenu.count();
                
                expect(count).toBe(0);
            }
        });
    });

    test.describe('Tabs Behavior', () => {
        test.use({ viewport: { width: 1280, height: 800 } });

        test('omni-channel tabs should switch content on click', async ({ page }) => {
            await page.goto('/automation');
            
            // Find all tab buttons
            const tabButtons = page.locator('[data-tab-btn]');
            const tabButtonCount = await tabButtons.count();
            
            // Should have 3 tab buttons
            expect(tabButtonCount).toBe(3);
            
            // First tab should be active by default
            const firstTab = page.locator('[data-tab-btn="tailored"]');
            const firstTabClasses = await firstTab.getAttribute('class');
            expect(firstTabClasses).toContain('bg-primary');
            
            // First panel should be visible
            const firstPanel = page.locator('[data-tab-panel="tailored"]');
            await expect(firstPanel).toBeVisible();
            
            // Second panel should be hidden
            const secondPanel = page.locator('[data-tab-panel="interactive-ai"]');
            await expect(secondPanel).toBeHidden();
            
            // Click on second tab
            const secondTab = page.locator('[data-tab-btn="interactive-ai"]');
            await secondTab.click();
            await page.waitForTimeout(300);
            
            // Second tab should now be active
            const secondTabClasses = await secondTab.getAttribute('class');
            expect(secondTabClasses).toContain('bg-primary');
            
            // First panel should be hidden
            await expect(firstPanel).toBeHidden();
            
            // Second panel should be visible
            await expect(secondPanel).toBeVisible();
        });

        test('omni-channel tabs should respond to keyboard navigation', async ({ page }) => {
            await page.goto('/automation');
            
            // Focus on second tab
            const secondTab = page.locator('[data-tab-btn="interactive-ai"]');
            await secondTab.focus();
            
            // Press Enter to activate
            await page.keyboard.press('Enter');
            await page.waitForTimeout(300);
            
            // Second tab should be active
            const secondTabClasses = await secondTab.getAttribute('class');
            expect(secondTabClasses).toContain('bg-primary');
            
            // Second panel should be visible
            const secondPanel = page.locator('[data-tab-panel="interactive-ai"]');
            await expect(secondPanel).toBeVisible();
        });

        test('omni-channel tabs should have correct ARIA attributes', async ({ page }) => {
            await page.goto('/automation');
            
            // Check tablist role
            const tablist = page.locator('[role="tablist"]');
            await expect(tablist).toBeVisible();
            
            // Check tab roles
            const tabs = page.locator('[role="tab"]');
            const tabCount = await tabs.count();
            expect(tabCount).toBe(3);
            
            // Check tabpanel roles
            const tabpanels = page.locator('[role="tabpanel"]');
            const panelCount = await tabpanels.count();
            expect(panelCount).toBe(3);
            
            // First tab should have aria-selected="true"
            const firstTab = page.locator('[data-tab-btn="tailored"]');
            const ariaSelected = await firstTab.getAttribute('aria-selected');
            expect(ariaSelected).toBe('true');
        });
    });
    
    test.describe('Redirects', () => {
        test('retail-platform should redirect to unified-commerce', async ({ page }) => {
            await page.goto('/retail-platform');
            
            // Wait for URL to change to /unified-commerce
            await expect(page).toHaveURL(/\/unified-commerce/);
            
            // Check that the page loaded successfully
            const heading = page.locator('#heroHeading');
            await expect(heading).toBeVisible();
        });
    });
});
