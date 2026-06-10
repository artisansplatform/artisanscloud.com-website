import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

// Auto-discover every built page (root + generated team cards) so new pages are
// covered without touching this file. Mirrors the glob behavior in
// vite.config.js and tests/build.test.js.
const pages = [
  ...glob.sync("*.html", { cwd: rootDir }),
  ...glob.sync("team/*.html", { cwd: rootDir }),
];

// Parse a built page from dist/ (post-Handlebars) into a DOM document.
function loadPage(page) {
  const pagePath = path.join(distDir, page);
  const html = fs.readFileSync(pagePath, "utf-8");
  return { html, doc: new JSDOM(html).window.document };
}

// Redirect stubs (meta refresh) are not indexable content pages, so most of the
// on-page SEO invariants do not apply to them.
function isRedirectStub(html) {
  return /http-equiv=["']refresh["']/i.test(html);
}

describe("SEO invariants (per page)", () => {
  beforeAll(() => {
    if (!fs.existsSync(distDir)) {
      throw new Error(
        'dist directory does not exist. Run "npm run build" before running tests.',
      );
    }
  });

  it("discovers pages to test", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  describe.each(pages)("%s", (page) => {
    it("declares a document language (<html lang>)", () => {
      const { doc } = loadPage(page);
      const lang = doc.documentElement.getAttribute("lang");
      expect(lang, `${page} is missing <html lang>`).toBeTruthy();
    });

    it("has exactly one <h1>", () => {
      const { html, doc } = loadPage(page);
      if (isRedirectStub(html)) return;
      const count = doc.querySelectorAll("h1").length;
      expect(
        count,
        `${page} should have exactly one <h1>, found ${count}`,
      ).toBe(1);
    });

    it("keeps og:url on the same host as the canonical URL", () => {
      const { doc } = loadPage(page);
      const canonical = doc
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href");
      const ogUrl = doc
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content");
      if (!canonical || !ogUrl) return;
      expect(
        new URL(ogUrl).host,
        `${page}: og:url host must match canonical host`,
      ).toBe(new URL(canonical).host);
    });

    it("provides Twitter card + meta description when it has Open Graph tags", () => {
      const { doc } = loadPage(page);
      const hasOg = doc.querySelector('meta[property="og:title"]');
      if (!hasOg) return;

      const twitterCard = doc
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute("content");
      expect(twitterCard, `${page} is missing a twitter:card meta tag`).toBe(
        "summary_large_image",
      );

      const description = doc
        .querySelector('meta[name="description"]')
        ?.getAttribute("content");
      expect(
        description?.trim(),
        `${page} is missing a non-empty meta description`,
      ).toBeTruthy();
    });

    it("emits valid JSON-LD structured data on indexable pages", () => {
      const { html, doc } = loadPage(page);
      if (isRedirectStub(html)) return;
      const hasOg = doc.querySelector('meta[property="og:title"]');
      const blocks = [
        ...doc.querySelectorAll('script[type="application/ld+json"]'),
      ];

      // Pages with no OG block (404, blog-detail, thank-you) opt out of schema.
      if (!hasOg) return;

      expect(
        blocks.length,
        `${page} should carry at least one JSON-LD block`,
      ).toBeGreaterThan(0);

      const types = new Set();
      for (const block of blocks) {
        let parsed;
        expect(() => {
          parsed = JSON.parse(block.textContent);
        }, `${page}: JSON-LD must be valid JSON`).not.toThrow();
        for (const node of parsed["@graph"] ?? [parsed]) {
          if (node["@type"]) types.add(node["@type"]);
        }
      }

      // Homepage carries site identity, team cards describe a Person, every
      // other indexable page gets a breadcrumb.
      const expected =
        page === "index.html"
          ? "Organization"
          : page.startsWith("team/")
            ? "Person"
            : "BreadcrumbList";
      expect(types, `${page} should declare a ${expected}`).toContain(expected);
    });
  });
});
