// Guards the per-page sitemap priority/changefreq values in pages.json and
// the generated dist/sitemap.xml, so a hand-edit or a generator regression
// cannot drift the two apart, and every indexable page states its own
// priority/changefreq instead of silently inheriting DEFAULT_META.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { loadPages } from "../scripts/lib/page-meta.js";
import { contentPages } from "../scripts/lib/site-files.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const PRIORITY_RE = /^(1\.0|0\.[0-9])$/;
const VALID_CHANGEFREQ = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

const meta = loadPages();
const indexablePages = contentPages().filter(
  (f) => meta[f.replace(/\.html$/, "")]?.sitemap !== false,
);

describe("pages.json sitemap metadata", () => {
  it.each(indexablePages)(
    "%s has an explicit sitemap priority and changefreq",
    (file) => {
      const slug = file.replace(/\.html$/, "");
      const sitemap = meta[slug]?.sitemap;
      expect(
        sitemap,
        `${slug} is indexable but has no explicit "sitemap": { priority, changefreq } ` +
          "block in assets/data/pages.json. Every indexable page must state its own " +
          "values rather than inheriting DEFAULT_META.",
      ).toBeTruthy();
      expect(
        sitemap.priority,
        `${slug}: sitemap.priority "${sitemap.priority}" must match ${PRIORITY_RE}`,
      ).toMatch(PRIORITY_RE);
      expect(
        VALID_CHANGEFREQ.has(sitemap.changefreq),
        `${slug}: sitemap.changefreq "${sitemap.changefreq}" is not a valid ` +
          `sitemaps.org value (${[...VALID_CHANGEFREQ].join(", ")})`,
      ).toBe(true);
    },
  );
});

describe("dist/sitemap.xml matches pages.json", () => {
  const sitemapPath = path.join(distDir, "sitemap.xml");
  const exists = fs.existsSync(sitemapPath);

  it.runIf(exists)(
    "every <url> reports the priority/changefreq from pages.json",
    () => {
      const xml = fs.readFileSync(sitemapPath, "utf-8");
      const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
        (m) => m[1],
      );

      const entries = urlBlocks.map((block) => {
        const loc = block.match(/<loc>([^<]+)<\/loc>/)[1];
        const priority = block.match(/<priority>([^<]+)<\/priority>/)[1];
        const changefreq = block.match(/<changefreq>([^<]+)<\/changefreq>/)[1];
        const slug = new URL(loc).pathname.replace(/^\//, "") || "index";
        return { slug, priority, changefreq };
      });

      for (const entry of entries) {
        const expected = meta[entry.slug]?.sitemap;
        expect(
          expected,
          `dist/sitemap.xml has an entry for "${entry.slug}" with no matching ` +
            "explicit sitemap block in pages.json",
        ).toBeTruthy();
        expect(entry.priority).toBe(expected.priority);
        expect(entry.changefreq).toBe(expected.changefreq);
      }

      expect(entries.length).toBe(indexablePages.length);
    },
  );

  it.runIf(exists)("priorities are sorted non-increasing", () => {
    const xml = fs.readFileSync(sitemapPath, "utf-8");
    const priorities = [
      ...xml.matchAll(/<priority>([^<]+)<\/priority>/g),
    ].map((m) => parseFloat(m[1]));

    for (let i = 1; i < priorities.length; i++) {
      expect(
        priorities[i],
        "dist/sitemap.xml priorities must be non-increasing (generate-sitemap.js " +
          "sorts by priority descending); found an increase at index " + i,
      ).toBeLessThanOrEqual(priorities[i - 1]);
    }
  });
});
