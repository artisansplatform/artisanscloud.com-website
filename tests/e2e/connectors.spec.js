import { expect, test } from "@playwright/test";

test.describe("Connectors filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/connectors", { waitUntil: "domcontentloaded" });
  });

  const visible = (page) => page.locator("#connectorsGrid > li:not(.hidden)");

  test("filters by search text and shows empty state", async ({ page }) => {
    await page.fill("#connectorsSearch", "slack");
    await expect(visible(page)).toHaveCount(1);

    await page.fill("#connectorsSearch", "zzzz");
    await expect(visible(page)).toHaveCount(0);
    await expect(page.locator("#connectorsEmpty")).toBeVisible();
  });

  test("filters by category and View all resets", async ({ page }) => {
    const total = await page.locator("#connectorsGrid > li").count();

    await page.selectOption("#connectorsCategory", "Single sign-on");
    await expect(visible(page)).toHaveCount(3);

    await page.fill("#connectorsSearch", "okta");
    await expect(visible(page)).toHaveCount(1);

    await page.click("#connectorsReset");
    await expect(visible(page)).toHaveCount(total);
  });
});
