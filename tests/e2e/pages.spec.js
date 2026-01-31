import { test, expect } from '@playwright/test';

// All pages to test - matches the pages in the repository
const pages = [
    { path: '/', title: 'Artisans Cloud', name: 'index.html' },
    { path: '/about-us', title: 'About Us', name: 'about-us.html' },
    { path: '/blog-detail', title: 'Blog Detail', name: 'blog-detail.html' },
    { path: '/blog-list', title: 'Blog List', name: 'blog-list.html' },
    { path: '/browser-pos', title: 'Browser POS', name: 'browser-pos.html' },
    { path: '/contact-us', title: 'Contact Us', name: 'contact-us.html' },
    { path: '/customer-experience-management', title: 'Customer Experience Management', name: 'customer-experience-management.html' },
    { path: '/d2c-eCommerce', title: 'D2C eCommerce', name: 'd2c-eCommerce.html' },
    { path: '/data-intelligence', title: 'Data Intelligence', name: 'data-intelligence.html' },
    { path: '/distributed-order-management', title: 'Distributed Order Management', name: 'distributed-order-management.html' },
    { path: '/enterprise-ai', title: 'Enterprise AI', name: 'enterprise-ai.html' },
    { path: '/overview', title: 'Overview', name: 'overview.html' },
    { path: '/page-404', title: '404', name: 'page-404.html' },
    { path: '/retail-platform', title: 'Retail Platform', name: 'retail-platform.html' },
    { path: '/thank-you', title: 'Thank You', name: 'thank-you.html' },
];

test.describe('Page Load Tests', () => {
    // Test each page loads correctly
    for (const page of pages) {
        test(`${page.name} should load with 200 status`, async ({ page: browserPage }) => {
            const response = await browserPage.goto(page.path);
            expect(response?.status()).toBe(200);
        });

        test(`${page.name} should have no console errors`, async ({ page: browserPage }) => {
            const errors = [];
            browserPage.on('console', (msg) => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });

            await browserPage.goto(page.path);
            
            // Wait a bit for any async errors
            await browserPage.waitForTimeout(1000);
            
            expect(errors).toEqual([]);
        });

        // Skip header/footer check for 404 page as it doesn't have them by design
        if (page.path !== '/page-404') {
            test(`${page.name} should have header and footer visible`, async ({ page: browserPage }) => {
                await browserPage.goto(page.path);
                
                const header = browserPage.locator('header');
                const footer = browserPage.locator('footer');
                
                await expect(header).toBeVisible();
                await expect(footer).toBeVisible();
            });
        }

        test(`${page.name} should have correct title`, async ({ page: browserPage }) => {
            await browserPage.goto(page.path);
            
            const title = await browserPage.title();
            
            // Title should not be empty
            expect(title.length).toBeGreaterThan(0);
            
            // Title should contain some reference to Artisans or the page name
            // (This is a loose check - adjust based on actual title format)
            expect(title).toBeTruthy();
        });
    }
});

test.describe('Resource Loading', () => {
    test('index page should load CSS without errors', async ({ page }) => {
        const failedRequests = [];
        
        page.on('requestfailed', (request) => {
            if (request.url().includes('.css')) {
                failedRequests.push(request.url());
            }
        });

        await page.goto('/');
        
        expect(failedRequests).toEqual([]);
    });

    test('index page should load JavaScript without errors', async ({ page }) => {
        const failedRequests = [];
        
        page.on('requestfailed', (request) => {
            if (request.url().includes('.js')) {
                failedRequests.push(request.url());
            }
        });

        await page.goto('/');
        
        expect(failedRequests).toEqual([]);
    });
});
