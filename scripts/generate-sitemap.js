#!/usr/bin/env node

/**
 * Build-time sitemap generator.
 *
 * Discovers all *.html files in the project root (same glob as vite.config.js),
 * excludes utility/non-indexable pages, and writes dist/sitemap.xml.
 *
 * Run automatically as part of `npm run build` via the build:sitemap script.
 * Must run AFTER build:html (Vite) so that dist/ already exists.
 *
 * Usage:
 *   node scripts/generate-sitemap.js [--base-url https://example.com]
 */

import { glob } from 'glob';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadPages } from './lib/page-meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { baseUrl: 'https://www.artisanscloud.com' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      opts.baseUrl = args[++i].replace(/\/$/, '');
    }
  }
  return opts;
}

// Per-page data lives in assets/data/pages.json (see scripts/lib/page-meta.js):
//   sitemap: false           -> page excluded from the sitemap
//   sitemap: { priority, changefreq } -> per-page override
//   no sitemap field         -> DEFAULT_META
const PAGES_META = loadPages();

const DEFAULT_META = { priority: '0.6', changefreq: 'monthly' };

function pageToUrl(baseUrl, filename) {
  if (filename === 'index.html') return `${baseUrl}/`;
  // Vercel cleanUrls: true, omit .html extension
  // Handles both root pages and blog/slug.html paths
  const slug = filename.replace('.html', '');
  return `${baseUrl}/${slug}`;
}

const BLOG_META = { priority: '0.7', changefreq: 'weekly' };

function main() {
  const { baseUrl } = parseArgs();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const pages = glob
    .sync('*.html', { cwd: ROOT })
    .filter(f => PAGES_META[f.replace('.html', '')]?.sitemap !== false)
    .sort();

  // Include generated blog article pages
  const blogPages = glob
    .sync('blog/*.html', { cwd: ROOT })
    .sort();

  function makeUrlEntry(loc, priority, changefreq) {
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  }

  const urlEntries = pages.map(page => {
    const { priority, changefreq } =
      PAGES_META[page.replace('.html', '')]?.sitemap ?? DEFAULT_META;
    const loc = pageToUrl(baseUrl, page);
    return makeUrlEntry(loc, priority, changefreq);
  });

  const blogEntries = blogPages.map(page => {
    const loc = pageToUrl(baseUrl, page);
    return makeUrlEntry(loc, BLOG_META.priority, BLOG_META.changefreq);
  });

  const allEntries = [...urlEntries, ...blogEntries];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    allEntries.join('\n'),
    '</urlset>',
    '', // trailing newline
  ].join('\n');

  const outPath = join(ROOT, 'dist', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`sitemap.xml: ${pages.length + blogPages.length} URLs written → dist/sitemap.xml`);
}

main();
