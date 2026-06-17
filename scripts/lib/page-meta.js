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

// Stable site-wide identity used in JSON-LD structured data.
const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "Artisans Cloud",
  url: `${BASE_URL}/`,
  logo: `${BASE_URL}/assets/image/logo.svg`,
  sameAs: ["https://www.linkedin.com/company/artisanscommercecloud/"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@artisanscloud.com.my",
  },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "Artisans Cloud",
  url: `${BASE_URL}/`,
  publisher: { "@id": ORGANIZATION["@id"] },
};

export function loadPages() {
  return JSON.parse(
    readFileSync(join(ROOT, "assets", "data", "pages.json"), "utf-8"),
  );
}

export function pageUrl(slug) {
  return slug === "index" ? `${BASE_URL}/` : `${BASE_URL}/${slug}`;
}

// Human-readable page name for breadcrumbs: the <title> without the brand
// suffix ("Dynamic Pricing | Artisans Cloud" -> "Dynamic Pricing").
export function pageName(title) {
  return title.replace(/\s*[|-]\s*Artisans Cloud\s*$/, "").trim();
}

// Structured data (JSON-LD) for a page, returned pre-serialized so the
// template can inject it raw without Handlebars HTML-escaping breaking the
// JSON. Homepage carries the Organization + WebSite graph; every other
// indexable page gets a Home > Page breadcrumb. Pages with the OG block
// disabled (404, thank-you, blog-detail) and redirect stubs (no title) get
// none. Page-specific schema (e.g. SoftwareApplication, FAQPage) stays inline
// in the page itself.
export function buildJsonLd(slug, meta) {
  if (slug === "index") {
    return graph([ORGANIZATION, WEBSITE]);
  }
  // No breadcrumb without a name; also skips OG-disabled pages and stubs.
  if (meta.og === false || !meta.title) return null;
  return graph([
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${BASE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageName(meta.title),
          item: pageUrl(slug),
        },
      ],
    },
  ]);
}

function graph(nodes) {
  return JSON.stringify(
    { "@context": "https://schema.org", "@graph": nodes },
    null,
    2,
  );
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
    jsonLd: buildJsonLd(slug, meta),
  };
}
