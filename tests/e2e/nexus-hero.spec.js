import { test, expect } from "@playwright/test";

// The Nexus hero simulation (assets/script/modules/nexus-hero.js) is
// interactive from xl (1280px) and a plain picture below that.
const NEXUS = "/unified-commerce/nexus";

test.describe("Nexus hero simulation", () => {
  test.describe("at xl", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    for (const reducedMotion of ["no-preference", "reduce"]) {
      test(`a tapped test order finishes (reduced motion: ${reducedMotion})`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion });
        await page.goto(NEXUS);
        await page.locator("#nx-ch-web").click();
        // The canvas particle has to reach a location for the last steps and
        // the demo link to appear, so this fails if the canvas stops drawing.
        await expect(
          page.locator("#nx-pBody a[data-cta='nexus-demo-panel']"),
        ).toBeVisible({ timeout: 15000 });
      });
    }

    test("a tapped order is announced to screen readers", async ({ page }) => {
      // Reduced motion turns the auto demo off, so it cannot swallow the tap.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(NEXUS);
      const live = page.locator("#nx-live");
      await expect(live).toHaveAttribute("aria-live", "polite");
      await expect(live).toBeEmpty();
      await page.locator("#nx-ch-web").click();
      await expect(live).toContainText("Test order from Website started");
      await expect(live).toContainText("Test order from Website routed to", {
        timeout: 15000,
      });
    });

    test("the peak toggle exposes its pressed state", async ({ page }) => {
      await page.goto(NEXUS);
      const surge = page.locator("#nx-surge");
      await expect(surge).toHaveAttribute("aria-pressed", "false");
      await surge.click();
      await expect(surge).toHaveAttribute("aria-pressed", "true");
      await expect(surge).toContainText("11.11 peak running");
      await surge.click();
      await expect(surge).toHaveAttribute("aria-pressed", "false");
    });
  });

  test.describe("below xl", () => {
    test.use({ viewport: { width: 1024, height: 800 } });

    test("the stage is an inert, labelled image", async ({ page }) => {
      await page.goto(NEXUS);
      await expect(page.locator("#nx-stage")).toHaveJSProperty("inert", true);
      await expect(page.locator("#nx-wrap")).toHaveAttribute("role", "img");
      await expect(page.locator("#nx-wrap")).toHaveAttribute(
        "aria-label",
        /.+/,
      );
    });
  });
});
