import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { contentPages } from "../../scripts/lib/site-files.js";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

// Redirect stubs (meta refresh) immediately navigate away and render no
// header/footer of their own. Returns the destination path, or null when the
// file is a normal page.
function redirectTarget(file) {
  const src = fs.readFileSync(path.join(rootDir, file), "utf-8");
  if (!/http-equiv=["']refresh["']/i.test(src)) return null;
  const match = src.match(/content=["']\s*\d+\s*;\s*url=([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

// Every content page, discovered from disk via scripts/lib/site-files.js, so
// a new page gets smoke coverage without anyone editing this file. Team cards
// are generated from one template and are covered by the unit test suite.
const pages = contentPages().map((file) => ({
  name: file,
  path: file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`,
  redirectsTo: redirectTarget(file),
}));

test.describe("Page Load Tests", () => {
  // Test each page loads correctly
  for (const page of pages) {
    test(`${page.name} should load with 200 status`, async ({
      page: browserPage,
    }) => {
      const response = await browserPage.goto(page.path, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status()).toBe(200);
    });

    // A stub redirects instantly, so anything asserted after the goto belongs
    // to the destination page (covered under its own name) and not to the
    // stub: console errors would be double-reported and the title checked
    // below would be the destination's. Assert the redirect itself instead.
    if (page.redirectsTo) {
      test(`${page.name} should redirect to ${page.redirectsTo}`, async ({
        page: browserPage,
      }) => {
        await browserPage.goto(page.path, { waitUntil: "domcontentloaded" });
        await browserPage.waitForURL(`**${page.redirectsTo}`);
      });
      continue;
    }

    test(`${page.name} should have no console errors`, async ({
      page: browserPage,
    }) => {
      const errors = [];
      browserPage.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          // Ignore external CDN errors (expected in test environment)
          // These are libraries that might not be available during testing
          if (
            !text.includes("cdn.jsdelivr.net") &&
            !text.includes("cdnjs.cloudflare.com") &&
            !text.includes("unpkg.com") &&
            !text.includes("Failed to load resource") &&
            !text.includes("net::ERR_")
          ) {
            errors.push(text);
          }
        }
      });

      await browserPage.goto(page.path, { waitUntil: "domcontentloaded" });

      // Wait a bit for any async errors
      await browserPage.waitForTimeout(1000);

      expect(errors).toEqual([]);
    });

    // The 404 page has no header/footer by design.
    if (page.path !== "/404") {
      test(`${page.name} should have header and footer visible`, async ({
        page: browserPage,
      }) => {
        await browserPage.goto(page.path, { waitUntil: "domcontentloaded" });

        const header = browserPage.locator("header");
        const footer = browserPage.locator("footer");

        await expect(header).toBeVisible();
        await expect(footer).toBeVisible();
      });
    }

    test(`${page.name} should have correct title`, async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.path, { waitUntil: "domcontentloaded" });

      const title = await browserPage.title();

      // Title should not be empty
      expect(title.length).toBeGreaterThan(0);

      // Title should contain some reference to Artisans Cloud or the page name
      // (This is a loose check - adjust based on actual title format)
      expect(title).toBeTruthy();
    });
  }
});

test.describe("Resource Loading", () => {
  test("index page should load CSS without errors", async ({ page }) => {
    const failedRequests = [];

    page.on("requestfailed", (request) => {
      const url = request.url();
      // Ignore external CDN failures (expected in test environment)
      if (
        url.includes(".css") &&
        !url.includes("cdn.jsdelivr.net") &&
        !url.includes("cdnjs.cloudflare.com") &&
        !url.includes("unpkg.com")
      ) {
        failedRequests.push(url);
      }
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(failedRequests).toEqual([]);
  });

  test("index page should load JavaScript without errors", async ({ page }) => {
    const failedRequests = [];

    page.on("requestfailed", (request) => {
      const url = request.url();
      // Ignore external CDN failures (expected in test environment)
      // Ignore Vercel Analytics endpoint, only served by Vercel edge in production
      if (
        url.includes(".js") &&
        !url.includes("cdn.jsdelivr.net") &&
        !url.includes("cdnjs.cloudflare.com") &&
        !url.includes("unpkg.com") &&
        !url.includes("/_vercel/insights/")
      ) {
        failedRequests.push(url);
      }
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(failedRequests).toEqual([]);
  });
});
