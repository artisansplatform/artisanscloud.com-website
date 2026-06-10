// Single source of truth for per-page metadata.
//
// assets/data/pages.json holds one entry per root HTML page (keyed by slug,
// the filename without .html). It drives:
//   - the head-meta Handlebars partial (via the context function in
//     vite.config.js), which renders title/description/canonical/OG tags
//   - scripts/generate-sitemap.js (priority/changefreq, exclusions)
//   - scripts/generate-og-images.js (og card title/subtitle text)
//
// Entry schema (all fields except title/description are optional):
//   title          page <title> (also og:title default)
//   description    meta description (also og:description default)
//   keywords       meta keywords
//   robots         meta robots (e.g. "noindex")
//   og             false to omit the whole Open Graph/Twitter block
//   ogTitle        override for og:title
//   ogDescription  override for og:description
//   ogImage        site-relative override for og:image (default /assets/og/{slug}.png)
//   ogCard         { title, subtitle } text baked into the generated OG image
//   sitemap        false to exclude from sitemap.xml, or { priority, changefreq }

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

export const BASE_URL = "https://www.artisanscloud.com";

export function loadPages() {
  return JSON.parse(
    readFileSync(join(ROOT, "assets", "data", "pages.json"), "utf-8"),
  );
}

export function pageUrl(slug) {
  return slug === "index" ? `${BASE_URL}/` : `${BASE_URL}/${slug}`;
}

// Template variables for the head-meta partial.
export function headContext(slug, meta) {
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: meta.robots,
    canonicalUrl: pageUrl(slug),
    og: meta.og !== false,
    ogTitle: meta.ogTitle || meta.title,
    ogDescription: meta.ogDescription || meta.description,
    ogImageUrl: meta.ogImage
      ? `${BASE_URL}${meta.ogImage}`
      : `${BASE_URL}/assets/og/${slug}.png`,
  };
}
