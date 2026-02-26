import { expect, test } from '@playwright/test';

test.describe('Dynamic Blog Articles', () => {
    test.describe('Blog List Page', () => {
        test('should have #blog-grid container', async ({ page }) => {
            await page.goto('/blog-list');
            const blogGrid = page.locator('#blog-grid');
            await expect(blogGrid).toBeVisible();
        });

        test('should render blog cards from fallback data', async ({ page }) => {
            await page.goto('/blog-list');
            await page.waitForTimeout(500);

            const blogGrid = page.locator('#blog-grid');
            const cards = blogGrid.locator('> div');

            // Should render exactly 9 cards from fallback data
            const count = await cards.count();
            expect(count).toBe(9);
        });

        test('blog cards should have correct structure', async ({ page }) => {
            await page.goto('/blog-list');
            await page.waitForTimeout(500);

            const firstCard = page.locator('#blog-grid > div').first();

            // Should have an image
            await expect(firstCard.locator('img')).toBeVisible();

            // Should have a title
            const title = firstCard.locator('.text-heading.font-semibold');
            await expect(title).toBeVisible();
            const titleText = await title.textContent();
            expect(titleText.length).toBeGreaterThan(0);

            // Should have a LinkedIn link
            const link = firstCard.locator('a[target="_blank"]');
            await expect(link).toBeVisible();
            const href = await link.getAttribute('href');
            expect(href).toContain('linkedin.com');
        });

        test('blog cards should have category badges', async ({ page }) => {
            await page.goto('/blog-list');
            await page.waitForTimeout(500);

            const firstCard = page.locator('#blog-grid > div').first();
            const badge = firstCard.locator('.bg-\\[\\#F5EEFE\\]');
            await expect(badge).toBeVisible();

            const badgeText = await badge.textContent();
            expect(badgeText.length).toBeGreaterThan(0);
        });
    });

    test.describe('Homepage Insights Section', () => {
        test('should have #insights-grid container', async ({ page }) => {
            await page.goto('/');
            const insightsGrid = page.locator('#insights-grid');
            await expect(insightsGrid).toBeVisible();
        });

        test('should render exactly 3 insight cards', async ({ page }) => {
            await page.goto('/');
            await page.waitForTimeout(500);

            const insightsGrid = page.locator('#insights-grid');
            const cards = insightsGrid.locator('> div');

            const count = await cards.count();
            expect(count).toBe(3);
        });

        test('insight cards should have correct structure', async ({ page }) => {
            await page.goto('/');
            await page.waitForTimeout(500);

            const firstCard = page.locator('#insights-grid > div').first();

            // Should have an image
            await expect(firstCard.locator('img')).toBeVisible();

            // Should have a title
            const title = firstCard.locator('.text-heading.font-semibold');
            await expect(title).toBeVisible();

            // Should have a LinkedIn link
            const link = firstCard.locator('a[target="_blank"]');
            await expect(link).toBeVisible();
            const href = await link.getAttribute('href');
            expect(href).toContain('linkedin.com');
        });
    });

    test.describe('Accessibility', () => {
        test('blog card links should have aria-labels', async ({ page }) => {
            await page.goto('/blog-list');
            await page.waitForTimeout(500);

            const links = page.locator('#blog-grid a[aria-label]');
            const count = await links.count();
            expect(count).toBe(9);
        });

        test('external links should have rel="noopener noreferrer"', async ({ page }) => {
            await page.goto('/blog-list');
            await page.waitForTimeout(500);

            const externalLinks = page.locator('#blog-grid a[target="_blank"]');
            const count = await externalLinks.count();

            for (let i = 0; i < count; i++) {
                const rel = await externalLinks.nth(i).getAttribute('rel');
                expect(rel).toContain('noopener');
                expect(rel).toContain('noreferrer');
            }
        });
    });
});
