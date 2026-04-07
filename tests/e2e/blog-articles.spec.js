import { expect, test } from '@playwright/test';

test.describe('Dynamic Blog Articles', () => {
    test.describe('Articles and Resources Page', () => {
        test('should have #blog-grid container', async ({ page }) => {
            await page.goto('/articles-and-resources');
            const blogGrid = page.locator('#blog-grid');
            await expect(blogGrid).toBeVisible();
        });

        test('should render blog cards from fallback data', async ({ page }) => {
            await page.goto('/articles-and-resources');
            await page.waitForTimeout(500);

            const blogGrid = page.locator('#blog-grid');
            const cards = blogGrid.locator('> div');

            // Should render exactly 9 cards from fallback data
            const count = await cards.count();
            expect(count).toBe(9);
        });

        test('blog cards should have correct structure', async ({ page }) => {
            await page.goto('/articles-and-resources');
            await page.waitForTimeout(500);

            const firstCard = page.locator('#blog-grid > div').first();

            // Should have an image
            await expect(firstCard.locator('img')).toBeVisible();

            // Should have a title
            const title = firstCard.locator('.text-heading.font-semibold');
            await expect(title).toBeVisible();
            const titleText = await title.textContent();
            expect(titleText.length).toBeGreaterThan(0);

            // Should have a LinkedIn link (image, title, and arrow are all links now)
            const link = firstCard.locator('a[target="_blank"]').first();
            await expect(link).toBeVisible();
            const href = await link.getAttribute('href');
            expect(href).toContain('linkedin.com');
        });

        test('blog cards should have category badges', async ({ page }) => {
            await page.goto('/articles-and-resources');
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

            // Should have a LinkedIn link (image, title, and arrow are all links now)
            const link = firstCard.locator('a[target="_blank"]').first();
            await expect(link).toBeVisible();
            const href = await link.getAttribute('href');
            expect(href).toContain('linkedin.com');
        });
    });

    test.describe('Load More', () => {
        function makeMockArticles(count) {
            return Array.from({ length: count }, (_, i) => ({
                id: `article-${i}`,
                title: `Test Article ${i + 1}`,
                description: `Description for article ${i + 1}`,
                url: 'https://www.linkedin.com/pulse/test',
                thumbnail: null,
                publishedAt: Date.now() - i * 86400000,
                category: 'Retail Insights',
            }));
        }

        test('Load More button is hidden when articles count is ≤ 9', async ({ page }) => {
            await page.route('/api/articles', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(makeMockArticles(9)),
                });
            });
            await page.goto('/articles-and-resources');
            await page.waitForTimeout(500);

            const loadMoreBtn = page.locator('#load-more-btn');
            await expect(loadMoreBtn).toBeHidden();
        });

        test('Load More button is visible when articles count is > 9', async ({ page }) => {
            await page.route('/api/articles', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(makeMockArticles(12)),
                });
            });
            await page.goto('/articles-and-resources');

            const loadMoreBtn = page.locator('#load-more-btn');
            await expect(loadMoreBtn).toBeVisible({ timeout: 2000 });

            const cards = page.locator('#blog-grid > div');
            await expect(cards).toHaveCount(9, { timeout: 2000 });
        });

        test('clicking Load More shows additional cards', async ({ page }) => {
            await page.route('/api/articles', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(makeMockArticles(12)),
                });
            });
            await page.goto('/articles-and-resources');

            const loadMoreBtn = page.locator('#load-more-btn');
            await expect(loadMoreBtn).toBeVisible({ timeout: 2000 });

            await loadMoreBtn.click();

            const cards = page.locator('#blog-grid > div');
            await expect(cards).toHaveCount(12, { timeout: 2000 });
            await expect(loadMoreBtn).toBeHidden();
        });
    });

    test.describe('Accessibility', () => {
        test('blog card links should have aria-labels', async ({ page }) => {
            await page.goto('/articles-and-resources');
            await page.waitForTimeout(500);

            const links = page.locator('#blog-grid a[aria-label]');
            const count = await links.count();
            // 9 cards × 2 aria-label links each (image + arrow button)
            expect(count).toBe(18);
        });

        test('external links should have rel="noopener noreferrer"', async ({ page }) => {
            await page.goto('/articles-and-resources');
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
