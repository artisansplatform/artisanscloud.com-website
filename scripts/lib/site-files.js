// Single source of truth for discovering the site's source HTML files.
//
// Discovery is recursive with a short exclusion list, so a brand-new page
// directory (like unified-commerce/ or knowledge-harvester/) is picked up
// automatically by the Vite build, the sitemap generator, and every test
// that imports from here. Nothing needs a per-directory glob any more.
//
// Do NOT hardcode page globs like glob.sync("some-dir/*.html") anywhere
// else. That pattern goes stale silently when a new directory appears;
// tests/coverage-guard.test.js fails the build if it comes back.

import { glob } from "glob";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SITE_ROOT = join(__dirname, "..", "..");

// Directories whose .html files are not served pages. Keep this list short:
// everything here is invisible to the build, the sitemap, and the tests.
// tests/coverage-guard.test.js cross-checks discovery against git, so a
// tracked page accidentally excluded here still fails loudly.
export const NON_PAGE_DIRS = [
  "node_modules", // dependencies
  "dist", // build output
  "partials", // Handlebars fragments, inlined at build time
  "playwright-report", // e2e tooling output
  "test-results", // e2e tooling output
  "blob-report", // e2e tooling output
];

// Every source page Vite builds and Vercel serves, as root-relative paths
// ("index.html", "team/gaurav-makhecha.html", "unified-commerce/nexus.html").
export function allPages() {
  return glob
    .sync("**/*.html", {
      cwd: SITE_ROOT,
      ignore: NON_PAGE_DIRS.map((dir) => `${dir}/**`),
    })
    .sort();
}

// Hand-written pages with a pages.json entry: everything except the
// generated team cards (their heads come from scripts/generate-team-cards.js
// and they stay out of the sitemap by design).
export function contentPages() {
  return allPages().filter((page) => !page.startsWith("team/"));
}

// Handlebars partials (fragments, never served directly).
export function partialFiles() {
  return glob.sync("partials/**/*.html", { cwd: SITE_ROOT }).sort();
}
