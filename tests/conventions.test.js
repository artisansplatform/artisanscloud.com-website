import { execFileSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { allPages } from "../scripts/lib/site-files.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(rootDir, rel), "utf-8");
}

// ---------------------------------------------------------------------------
// No inline executable scripts (CSP-readiness).
// All behavior must go through assets/script modules. Data blocks
// (application/ld+json, application/json) and external <script src> are fine.
// Meta-refresh redirect stubs are exempt: they are tiny standalone pages
// outside the module system.
// ---------------------------------------------------------------------------
describe("No inline executable scripts", () => {
  const pages = allPages();

  describe.each(pages)("%s", (page) => {
    it("has no inline <script> with executable code", () => {
      const html = read(page);
      if (/http-equiv=["']refresh["']/i.test(html)) return; // redirect stub

      const offenders = [];
      for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
        const attrs = m[1];
        if (/\bsrc=/i.test(attrs)) continue; // external script
        const type = attrs.match(/\btype=["']([^"']+)["']/i)?.[1] ?? "";
        if (/application\/(ld\+json|json)/i.test(type)) continue; // data block
        offenders.push(m[0]);
      }
      expect(
        offenders,
        `${page} has an inline executable <script>. Move the logic to an assets/script module imported by main.js (see modules/card-toggle.js).`,
      ).toEqual([]);
    });
  });
});

// ---------------------------------------------------------------------------
// Swiper slider selectors and their nav-button selectors must be unique.
// Reusing a class makes navigation control the wrong slider (or break).
// ---------------------------------------------------------------------------
describe("Swiper instances have unique selectors", () => {
  const src = read("assets/script/modules/swiper-sliders.js");

  function duplicates(values) {
    const seen = new Set();
    const dups = new Set();
    for (const v of values) (seen.has(v) ? dups : seen).add(v);
    return [...dups];
  }

  it("instantiates each Swiper with a unique selector", () => {
    const selectors = [...src.matchAll(/new Swiper\(\s*["']([^"']+)["']/g)].map(
      (m) => m[1],
    );
    expect(selectors.length).toBeGreaterThan(0);
    expect(
      duplicates(selectors),
      "Duplicate Swiper selector(s); each slider needs a unique class",
    ).toEqual([]);
  });

  it("uses unique navigation button selectors", () => {
    const navs = [
      ...src.matchAll(/(?:nextEl|prevEl):\s*["']([^"']+)["']/g),
    ].map((m) => m[1]);
    expect(
      duplicates(navs),
      "Duplicate Swiper nav button selector(s); next/prev classes must be unique per slider",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// vercel.json redirect integrity.
// ---------------------------------------------------------------------------
describe("vercel.json redirects are sound", () => {
  const vercel = JSON.parse(read("vercel.json"));
  const redirects = vercel.redirects ?? [];
  const pages = JSON.parse(read("assets/data/pages.json"));

  // Set of routes the site actually serves (clean URLs, no .html).
  const routes = new Set(
    allPages().map((f) =>
      f === "index.html" ? "/" : `/${f.replace(/\.html$/, "")}`,
    ),
  );
  const sources = new Set(redirects.map((r) => r.source));
  const isStub = (slug) =>
    /http-equiv=["']refresh["']/i.test(
      fs.existsSync(path.join(rootDir, `${slug}.html`))
        ? read(`${slug}.html`)
        : "",
    );

  it("has at least one redirect", () => {
    expect(redirects.length).toBeGreaterThan(0);
  });

  it("points every redirect at a destination that resolves", () => {
    const broken = redirects.filter((r) => {
      const dest = r.destination.replace(/[?#].*$/, "");
      return (
        !/^https?:\/\//.test(dest) && !routes.has(dest) && !sources.has(dest)
      );
    });
    expect(
      broken.map((r) => `${r.source} -> ${r.destination}`),
      "Redirect destination does not resolve to a page, another redirect, or an external URL",
    ).toEqual([]);
  });

  it("does not shadow a live content page with a redirect", () => {
    // A redirect whose source still resolves to a real, non-stub page means
    // visitors never see that page. Redirect stubs (retail-platform) are fine.
    const shadowed = redirects.filter((r) => {
      const slug = r.source.replace(/^\//, "");
      return routes.has(r.source) && slug && !isStub(slug);
    });
    expect(
      shadowed.map((r) => r.source),
      "Redirect source shadows a real content page; rename/remove the page or the redirect",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Em dashes are banned repo-wide (writing rule in the agent instructions,
// machine-enforced here so it never depends on anyone remembering it).
// Replace with commas, colons, semicolons, or parentheses.
// ---------------------------------------------------------------------------
describe("No em dashes in tracked text files", () => {
  // Escaped so this file's own source does not contain the character.
  const EM_DASH = "\u2014";

  it("git grep finds no em dash", () => {
    let hits = [];
    try {
      hits = execFileSync(
        "git",
        // -I skips binary files. fallback-articles.json carries external
        // LinkedIn content verbatim, so it is exempt from the writing rule.
        [
          "grep",
          "-I",
          "-l",
          EM_DASH,
          "--",
          ":!assets/data/fallback-articles.json",
        ],
        { cwd: rootDir, encoding: "utf-8" },
      )
        .split("\n")
        .filter(Boolean);
    } catch (error) {
      // git grep exits 1 when nothing matches; that is the passing case.
      if (error.status !== 1) throw error;
    }
    expect(
      hits,
      "Files containing an em dash. Replace it with a comma, colon, " +
        "semicolon, or parentheses (see the writing rules).",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Child processes must not go through a shell string: quoting that works in
// bash breaks in cmd.exe (a real Windows failure caught in the #113 review).
// execFileSync with an args array behaves identically on every platform.
// ---------------------------------------------------------------------------
describe("No shell-string child processes", () => {
  const files = [
    "vite.config.js",
    "playwright.config.js",
    ...glob.sync("scripts/**/*.js", { cwd: rootDir }),
    ...glob.sync("tests/**/*.js", { cwd: rootDir }),
  ];
  // Built by concatenation so this test file does not flag itself.
  const banned = new RegExp("\\bexec" + "Sync\\b");

  it.each(files)("%s", (file) => {
    expect(
      banned.test(read(file)),
      `${file} spawns a child process through a shell string. Use ` +
        "execFileSync(cmd, [args]) so quoting works on every platform.",
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Redirect stubs (meta-refresh pages) must be excluded from the sitemap.
// ---------------------------------------------------------------------------
describe("Redirect stubs stay out of the sitemap", () => {
  const pages = JSON.parse(read("assets/data/pages.json"));
  const stubs = allPages()
    .filter((f) => /http-equiv=["']refresh["']/i.test(read(f)))
    .map((f) => f.replace(/\.html$/, ""));

  it.each(stubs)("%s is marked sitemap: false", (slug) => {
    expect(
      pages[slug]?.sitemap,
      `${slug}.html is a redirect stub; add "${slug}": { "sitemap": false } to pages.json so it is not indexed`,
    ).toBe(false);
  });
});
