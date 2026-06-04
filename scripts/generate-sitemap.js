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

// Pages to exclude: no SEO value, utility-only, or parameterised shell pages
const EXCLUDED_PAGES = new Set([
  '404.html',
  'thank-you.html',
  'blog-detail.html', // JS-rendered shell; no stable canonical URL
  'request-demo.html', // Destination page, not indexed
]);

// Per-page SEO hints (anything not listed gets DEFAULT_META)
const PAGE_META = {
  'index.html':                                { priority: '1.0', changefreq: 'weekly'  },
  'unified-commerce.html':                     { priority: '0.9', changefreq: 'monthly' },
  'enterprise-ai.html':                        { priority: '0.9', changefreq: 'monthly' },
  'data-intelligence.html':                    { priority: '0.9', changefreq: 'monthly' },
  'about-us.html':                             { priority: '0.8', changefreq: 'monthly' },
  'articles-and-resources.html':                { priority: '0.8', changefreq: 'weekly'  },
  'contact-us.html':                           { priority: '0.7', changefreq: 'monthly' },
  'automation.html':                           { priority: '0.7', changefreq: 'monthly' },
  'integrations.html':                         { priority: '0.7', changefreq: 'monthly' },
  'browser-pos.html':                          { priority: '0.6', changefreq: 'monthly' },
  'POS.html':                                  { priority: '0.6', changefreq: 'monthly' },
  'customer-experience-management.html':       { priority: '0.6', changefreq: 'monthly' },
  'd2c-eCommerce.html':                        { priority: '0.6', changefreq: 'monthly' },
  'distributed-order-management.html':         { priority: '0.6', changefreq: 'monthly' },
  'knowledge-harvester.html':                  { priority: '0.6', changefreq: 'monthly' },
  'merchandise-and-assortment-planning.html':  { priority: '0.6', changefreq: 'monthly' },
  'role-play-agent.html':                      { priority: '0.6', changefreq: 'monthly' },
  'warehouse-management-system.html':          { priority: '0.6', changefreq: 'monthly' },
  'smart-auto-completion.html':                { priority: '0.6', changefreq: 'monthly' },
  'smart-product-search.html':                 { priority: '0.6', changefreq: 'monthly' },
  'smarter-inventory-alerts.html':             { priority: '0.7', changefreq: 'monthly' },
  'dify-consulting.html':                      { priority: '0.8', changefreq: 'monthly' },
  'lumen.html':                                { priority: '0.8', changefreq: 'monthly' },
  'image-editing.html':                        { priority: '0.7', changefreq: 'monthly' },
  'personalized-recommendations.html':         { priority: '0.9', changefreq: 'monthly' },
  'chatbots-for-quick-support.html':           { priority: '0.7', changefreq: 'monthly' },
  'customer-feedback-insights.html':           { priority: '0.7', changefreq: 'monthly' },
  'demand-flow.html':                          { priority: '0.9', changefreq: 'monthly' },
  'dynamic-pricing.html':                      { priority: '0.7', changefreq: 'monthly' },
  'store-layout-optimization.html':            { priority: '0.7', changefreq: 'monthly' },
  'fraud-detection.html':                      { priority: '0.7', changefreq: 'monthly' },
  'personalized-promotions.html':              { priority: '0.7', changefreq: 'monthly' },
  'privacy-policy.html':                       { priority: '0.3', changefreq: 'yearly'  },
  'terms-and-conditions.html':                 { priority: '0.3', changefreq: 'yearly'  },
};

const DEFAULT_META = { priority: '0.6', changefreq: 'monthly' };

function pageToUrl(baseUrl, filename) {
  if (filename === 'index.html') return `${baseUrl}/`;
  // Vercel cleanUrls: true, omit .html extension
  const slug = filename.replace('.html', '');
  return `${baseUrl}/${slug}`;
}

function main() {
  const { baseUrl } = parseArgs();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const pages = glob
    .sync('*.html', { cwd: ROOT })
    .filter(f => !EXCLUDED_PAGES.has(f))
    .sort();

  const urlEntries = pages.map(page => {
    const { priority, changefreq } = PAGE_META[page] ?? DEFAULT_META;
    const loc = pageToUrl(baseUrl, page);
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries.join('\n'),
    '</urlset>',
    '', // trailing newline
  ].join('\n');

  const outPath = join(ROOT, 'dist', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`sitemap.xml: ${pages.length} URLs written → dist/sitemap.xml`);
}

main();
