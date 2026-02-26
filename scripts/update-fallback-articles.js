#!/usr/bin/env node

/**
 * Update fallback articles from the live Vercel deployment.
 *
 * Fetches the latest articles from the deployed /api/articles endpoint,
 * downloads article thumbnail images locally, and updates
 * assets/data/fallback-articles.json.
 *
 * Usage:
 *   node scripts/update-fallback-articles.js [--url https://your-domain.vercel.app]
 *
 * Options:
 *   --url    Base URL of the deployed site (default: https://www.artisanscloud.com)
 *   --dry    Preview changes without writing files
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FALLBACK_JSON = join(ROOT, 'assets', 'data', 'fallback-articles.json');
const IMAGE_DIR = join(ROOT, 'assets', 'image', 'blog');
const MAX_ARTICLES = 9;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    url: 'https://www.artisanscloud.com',
    dry: false,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      opts.url = args[++i].replace(/\/$/, '');
    }
    if (args[i] === '--dry') {
      opts.dry = true;
    }
  }
  return opts;
}

async function downloadImage(imageUrl, localPath) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download ${imageUrl}: ${res.status}`);

  const contentType = res.headers.get('content-type') || '';
  let ext = '.jpg';
  if (contentType.includes('png')) ext = '.png';
  else if (contentType.includes('webp')) ext = '.webp';
  else if (contentType.includes('gif')) ext = '.gif';

  const finalPath = localPath.replace(/\.[^.]+$/, ext);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(finalPath, buffer);
  return finalPath;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function main() {
  const opts = parseArgs();
  const apiUrl = `${opts.url}/api/articles`;

  console.log(`Fetching articles from ${apiUrl}...`);
  const res = await fetch(apiUrl);
  if (!res.ok) {
    console.error(`Failed to fetch: HTTP ${res.status}`);
    process.exit(1);
  }

  const articles = await res.json();
  if (!Array.isArray(articles) || articles.length === 0) {
    console.error('No articles returned from API');
    process.exit(1);
  }

  const latest = articles.slice(0, MAX_ARTICLES);
  console.log(`Got ${articles.length} articles, keeping top ${latest.length}`);

  if (!opts.dry) {
    mkdirSync(IMAGE_DIR, { recursive: true });
  }

  const updated = [];
  for (let i = 0; i < latest.length; i++) {
    const article = latest[i];
    const slug = slugify(article.title);
    let localThumb = article.thumbnail;

    // Download external thumbnails locally
    if (article.thumbnail && article.thumbnail.startsWith('http')) {
      const filename = `blog-${slug}.jpg`;
      const localPath = join(IMAGE_DIR, filename);
      const webPath = `/assets/image/blog/${filename}`;

      if (opts.dry) {
        console.log(`  [dry] Would download: ${article.thumbnail}`);
        console.log(`         → ${webPath}`);
        localThumb = webPath;
      } else {
        try {
          const saved = await downloadImage(article.thumbnail, localPath);
          const savedFilename = saved.split('/').pop();
          localThumb = `/assets/image/blog/${savedFilename}`;
          console.log(`  Downloaded: ${localThumb}`);
        } catch (err) {
          console.warn(`  Warning: Could not download thumbnail for "${article.title}": ${err.message}`);
          // Keep the original URL as-is
        }
      }
    }

    updated.push({
      id: article.id || `fallback-${i + 1}`,
      title: article.title,
      description: article.description,
      url: article.url,
      thumbnail: localThumb,
      publishedAt: article.publishedAt,
      category: article.category,
    });
  }

  const json = JSON.stringify(updated, null, 2) + '\n';

  if (opts.dry) {
    console.log('\n--- Preview of fallback-articles.json ---');
    console.log(json);
    console.log('--- End preview (no files written) ---');
  } else {
    writeFileSync(FALLBACK_JSON, json);
    console.log(`\nUpdated ${FALLBACK_JSON}`);
    console.log(`Written ${updated.length} articles`);
    console.log('\nNext steps:');
    console.log('  1. Review the changes: git diff assets/');
    console.log('  2. Run: npm run build && npm test');
    console.log('  3. Commit the updated fallback data and images');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
