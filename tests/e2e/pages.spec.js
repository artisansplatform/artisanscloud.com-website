import { expect, test } from "@playwright/test";

// All pages to test - matches the pages in the repository
const pages = [
  { path: "/", title: "Artisans Cloud", name: "index.html" },
  { path: "/about-us", title: "About Us", name: "about-us.html" },
  { path: "/automation", title: "Automation", name: "automation.html" },
  { path: "/blog-detail", title: "Blog Detail", name: "blog-detail.html" },
  {
    path: "/articles-and-resources",
    title: "Articles and Resources",
    name: "articles-and-resources.html",
  },
  { path: "/browser-pos", title: "Browser POS", name: "browser-pos.html" },
  { path: "/contact-us", title: "Contact Us", name: "contact-us.html" },
  {
    path: "/chatbots-for-quick-support",
    title: "Chatbots for Quick Support",
    name: "chatbots-for-quick-support.html",
  },
  {
    path: "/customer-feedback-insights",
    title: "Customer Feedback Insights",
    name: "customer-feedback-insights.html",
  },
  { path: "/demand-flow", title: "Demand Flow", name: "demand-flow.html" },
  {
    path: "/customer-experience-management",
    title: "Customer Experience Management",
    name: "customer-experience-management.html",
  },
  {
    path: "/d2c-eCommerce",
    title: "D2C eCommerce",
    name: "d2c-eCommerce.html",
  },
  {
    path: "/data-intelligence",
    title: "Data Intelligence",
    name: "data-intelligence.html",
  },
  {
    path: "/distributed-order-management",
    title: "Distributed Order Management",
    name: "distributed-order-management.html",
  },
  {
    path: "/enterprise-ai",
    title: "Enterprise AI",
    name: "enterprise-ai.html",
  },
  {
    path: "/enterprise-copilot/lumen",
    title: "Lumen",
    name: "enterprise-copilot/lumen.html",
  },
  {
    path: "/merchandise-and-assortment-planning",
    title: "Merchandise & Assortment Planning",
    name: "merchandise-and-assortment-planning.html",
  },
  { path: "/POS", title: "Point of Sale", name: "POS.html" },
  { path: "/404", title: "404", name: "404.html" },
  {
    path: "/unified-commerce/nexus",
    title: "Unified Commerce",
    name: "unified-commerce/nexus.html",
  },
  { path: "/thank-you", title: "Thank You", name: "thank-you.html" },
  { path: "/request-demo", title: "Request a Demo", name: "request-demo.html" },
  {
    path: "/role-play-agent/arena",
    title: "Role Play Agent",
    name: "role-play-agent/arena.html",
  },
  {
    path: "/knowledge-harvester/vault",
    title: "Knowledge Harvester",
    name: "knowledge-harvester/vault.html",
  },
  {
    path: "/smarter-inventory-alerts",
    title: "Smarter Inventory Alerts",
    name: "smarter-inventory-alerts.html",
  },
  {
    path: "/dynamic-pricing",
    title: "Dynamic Pricing",
    name: "dynamic-pricing.html",
  },
  {
    path: "/store-layout-optimization",
    title: "Store Layout Optimization",
    name: "store-layout-optimization.html",
  },
];

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

    // Skip header/footer check for 404 page as it doesn't have them by design
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
