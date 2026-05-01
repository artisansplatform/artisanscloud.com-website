import { expect, test } from '@playwright/test';

test.describe('Request Demo Page', () => {
    test('renders with correct title and noindex meta', async ({ page }) => {
        await page.goto('/request-demo');
        await expect(page).toHaveTitle('Request a Demo | Artisans Cloud');
        const robots = page.locator('meta[name="robots"]');
        await expect(robots).toHaveAttribute('content', 'noindex');
    });

    test('all enterprise form fields are present', async ({ page }) => {
        await page.goto('/request-demo');
        for (const id of ['first_name', 'last_name', 'email', 'company_name', 'role', 'company_size', 'timeline', 'current_systems', 'message']) {
            await expect(page.locator(`#${id}`)).toBeVisible();
        }
    });

    test('required fields block submission when empty', async ({ page }) => {
        await page.goto('/request-demo');
        await page.locator('button[type="submit"]').click();

        // Native HTML5 validation prevents navigation, so we stay on the same page.
        await expect(page).toHaveURL(/request-demo/);

        const firstNameValid = await page.locator('#first_name').evaluate(el => el.checkValidity());
        expect(firstNameValid).toBe(false);
    });

    test('email field rejects invalid format', async ({ page }) => {
        await page.goto('/request-demo');
        await page.fill('#email', 'not-an-email');
        const valid = await page.locator('#email').evaluate(el => el.checkValidity());
        expect(valid).toBe(false);
    });

    test('successful submission redirects to thank-you page', async ({ page, baseURL }) => {
        await page.goto('/request-demo');

        // Intercept the Web3Forms POST and return a redirect to the local thank-you page.
        // This avoids a real network call in CI while still exercising the full form flow.
        await page.route('https://api.web3forms.com/submit', route =>
            route.fulfill({
                status: 302,
                headers: { location: `${baseURL}/thank-you` },
                body: '',
            })
        );

        await page.fill('#first_name', 'Jane');
        await page.fill('#last_name', 'Doe');
        await page.fill('#email', 'jane@example.com');
        await page.fill('#company_name', 'Acme Corp');
        await page.fill('#role', 'VP Commerce');
        await page.selectOption('#company_size', '51-200');
        await page.selectOption('#timeline', '1-3 months');

        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/thank-you/, { timeout: 10000 });
        // Confirm thank-you page actually loaded (not a blank redirect error)
        await expect(page.locator('body')).toBeVisible();
    });

    test('shows contact-us link for non-sales inquiries', async ({ page }) => {
        await page.goto('/request-demo');
        await expect(page.locator('a[href="/contact-us"]')).toBeVisible();
    });
});
