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
});
