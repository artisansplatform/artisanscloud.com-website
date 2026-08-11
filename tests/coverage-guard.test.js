// Guardrails for the guardrails.
//
// PR #111 moved pages into subdirectories and three configs plus five test
// files each carried their own hardcoded directory list; the ones that were
// missed simply went silent (pages skipped by tests, in the worst case pages
// not built at all). Page discovery now lives in scripts/lib/site-files.js,
// and this suite makes sure that discovery, the build output, the sitemap,
// and the configs cannot drift apart silently again.
//
// Every check here fails with instructions, not just an assertion.

import { execSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { BASE_URL, loadPages } from "../scripts/lib/page-meta.js";
import {
  allPages,
  contentPages,
  NON_PAGE_DIRS,
  partialFiles,
} from "../scripts/lib/site-files.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

function read(rel) {
  return fs.readFileSync(path.join(rootDir, rel), "utf-8");
}

// ---------------------------------------------------------------------------
// Discovery must match what git actually tracks. Catches both directions:
// a tracked page that discovery excludes (would be invisible to the build,
// the sitemap, and every test) and an untracked page that discovery includes
// (would work locally but never deploy, since Vercel builds from git).
// ---------------------------------------------------------------------------
describe("page discovery matches git", () => {
  let tracked = null;
  try {
    tracked = execSync("git ls-files -z -- '*.html'", { cwd: rootDir })
      .toString()
      .split("\0")
      .filter(Boolean)
      .filter((f) => !f.startsWith("partials/"))
      .sort();
  } catch {
    // Not a git checkout (e.g. exported tarball); the other guards still run.
  }

  it.runIf(tracked !== null)(
    "discovers every tracked page and nothing else",
    () => {
      const discovered = allPages();
      const missing = tracked.filter((f) => !discovered.includes(f));
      const extra = discovered.filter((f) => !tracked.includes(f));
      expect(
        missing,
        "Tracked .html files that page discovery does NOT see. " +
          "If these are real pages, a directory in NON_PAGE_DIRS " +
          "(scripts/lib/site-files.js) is wrongly excluding them. " +
          "If they were deleted, commit the deletion.",
      ).toEqual([]);
      expect(
        extra,
        "Discovered pages that git does not track. Untracked pages build " +
          "locally but never deploy: git add them (or delete strays).",
      ).toEqual([]);
    },
  );

  it("discovers a sane number of pages", () => {
    // Backstop for environments without git: a discovery regression that
    // returns almost nothing must never look like a passing suite.
    expect(allPages().length).toBeGreaterThan(20);
  });
});

// ---------------------------------------------------------------------------
// The sitemap must contain exactly the indexable content pages. The build
// tests only spot-check a few URLs; this is the full set, both directions.
// ---------------------------------------------------------------------------
describe("sitemap covers every indexable page exactly", () => {
  it("dist/sitemap.xml matches discovery + pages.json sitemap flags", () => {
    const sitemapPath = path.join(distDir, "sitemap.xml");
    expect(
      fs.existsSync(sitemapPath),
      'dist/sitemap.xml missing. Run "npm run build" before the tests.',
    ).toBe(true);

    const actual = [
      ...read("dist/sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g),
    ]
      .map((m) => m[1])
      .sort();

    const meta = loadPages();
    const expected = contentPages()
      .filter((f) => meta[f.replace(/\.html$/, "")]?.sitemap !== false)
      .map((f) =>
        f === "index.html"
          ? `${BASE_URL}/`
          : `${BASE_URL}/${f.replace(/\.html$/, "")}`,
      )
      .sort();

    const missing = expected.filter((u) => !actual.includes(u));
    const extra = actual.filter((u) => !expected.includes(u));
    expect(
      missing,
      "Indexable pages absent from dist/sitemap.xml. scripts/generate-sitemap.js " +
        "and this test derive the set independently; one of them regressed, or " +
        "dist/ is stale (rerun npm run build).",
    ).toEqual([]);
    expect(
      extra,
      "URLs in dist/sitemap.xml with no matching content page. Remove the page " +
        'from the sitemap or mark it "sitemap": false in pages.json.',
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Nobody gets to reintroduce a private page list. Every config and test must
// go through scripts/lib/site-files.js, otherwise the next new directory
// starts the same silent-staleness cycle PR #111 caught by luck.
// ---------------------------------------------------------------------------
describe("no hardcoded page discovery outside site-files.js", () => {
  const scanned = [
    "vite.config.js",
    ...glob.sync("scripts/**/*.js", { cwd: rootDir }),
    ...glob.sync("tests/**/*.js", { cwd: rootDir }),
  ].filter((f) => f !== "scripts/lib/site-files.js");

  it("no .html globs or root readdir page scans", () => {
    const offenders = [];
    for (const file of scanned) {
      const src = read(file);
      if (/(?:glob\.sync|globSync)\s*\(\s*["'`][^"'`]*\*\.html/.test(src)) {
        offenders.push(`${file}: glob for *.html`);
      }
      if (/readdirSync\s*\([^)]*rootDir[^)]*\)/.test(src)) {
        offenders.push(`${file}: readdirSync over the project root`);
      }
    }
    expect(
      offenders,
      "Page discovery hardcoded outside scripts/lib/site-files.js. Import " +
        "allPages()/contentPages()/partialFiles() from there instead; that is " +
        "the only file allowed to know where pages live.",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Tailwind v4 auto-detects source files and ignores tailwind.config.js
// (a JS config only loads through an explicit @config directive in the CSS).
// A resurrected config file would be silently dead: content globs nobody
// needs and theme edits that never apply.
// ---------------------------------------------------------------------------
describe("no dead Tailwind config", () => {
  it("tailwind.config.* does not exist", () => {
    const configs = glob.sync("tailwind.config.{js,cjs,mjs,ts}", {
      cwd: rootDir,
    });
    expect(
      configs,
      "Tailwind v4 ignores this file unless input.css opts in via @config, " +
        "so anything in it silently does nothing. Theme goes in @theme in " +
        "assets/style/input.css; source detection is automatic. " +
        "See docs/architecture.md (Styling).",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A full page saved into partials/ would never be served: partials are
// excluded from discovery by design. Catch the mistake at the source.
// ---------------------------------------------------------------------------
describe("partials stay fragments", () => {
  it.each(partialFiles())("%s is not a full HTML document", (file) => {
    expect(
      /<!doctype|<html[\s>]/i.test(read(file)),
      `${file} looks like a complete page. Pages live outside partials/; ` +
        "partials are build-time fragments and are never served.",
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// The exclusion list is load-bearing: everything in it is invisible to the
// build and the tests. Keep it small enough that every entry gets reviewed.
// ---------------------------------------------------------------------------
describe("exclusion list stays reviewable", () => {
  it("NON_PAGE_DIRS has not quietly grown", () => {
    expect(
      NON_PAGE_DIRS.length,
      "NON_PAGE_DIRS (scripts/lib/site-files.js) grew. Every entry hides " +
        "files from the build, the sitemap, and all tests; review each one " +
        "and raise this ceiling only deliberately.",
    ).toBeLessThanOrEqual(8);
  });
});
