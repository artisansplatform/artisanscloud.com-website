#!/usr/bin/env node

/**
 * Blog article HTML generator.
 *
 * Reads all blog/*.md files (YAML frontmatter + Markdown body), converts each
 * to a standalone blog/{slug}.html page, and writes the article index to
 * assets/data/local-articles.json for the frontend.
 *
 * Run:
 *   node scripts/generate-blog-articles.js              # regenerate all
 *   node scripts/generate-blog-articles.js --slug foo   # one article only
 *
 * Called automatically during `npm run build` as the build:blog step, which
 * runs before build:html so Vite picks up the generated HTML files.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { markdownToHtml } from './lib/markdown.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_DIR = join(ROOT, 'blog');
const LOCAL_ARTICLES_PATH = join(ROOT, 'assets', 'data', 'local-articles.json');

const FALLBACK_HERO = '/assets/image/blog-list/bloge-detail-banner.webp';
const FALLBACK_OG = 'https://www.artisanscloud.com/assets/og/articles-and-resources.png';
const BASE_URL = 'https://www.artisanscloud.com';

// Artisans Cloud logo SVG (inlined from blog-detail.html)
const LOGO_SVG = `<svg width="31" height="32" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0.246094 19.6272L4.38087 17.2184L8.7895 14.7002V23.0219C8.7895 23.4051 8.5978 23.7336 8.26918 23.9253C7.94056 24.1169 7.55754 24.1169 7.22854 23.9253L4.38087 22.2823L0.903337 20.2846C0.629486 20.12 0.383019 19.8736 0.246094 19.6272Z" fill="#0D9EA6"/>
  <path d="M12.7333 12.4002L7.72223 15.3017L1.64311 18.8059C1.01363 19.1888 0.848939 19.7637 1.39664 20.5576L0.903709 20.2838C0.630238 20.1196 0.383772 19.8732 0.246466 19.6268C0.0825358 19.353 0 19.0519 0 18.6964V5.06402C0 4.40699 0.329002 3.83208 0.903709 3.47619C1.50618 3.14767 2.16343 3.14767 2.73851 3.47619L7.72223 6.37771L12.7333 9.25225C13.3084 9.58038 13.6367 10.1553 13.6367 10.8397C13.6367 11.4967 13.3084 12.0716 12.7333 12.4002Z" fill="#12D9E3"/>
  <path d="M8.79129 14.7002V15.3298L2.82171 18.4777C1.67191 19.1074 0.686047 19.3812 1.39806 20.5584C0.850357 19.7644 1.01467 19.1895 1.64415 18.8063L4.38266 17.2188L7.72327 15.3024L8.79129 14.7002Z" fill="#09686D"/>
  <path d="M16.5949 0V9.8544L12.2137 7.33614L9.36602 5.69393C9.0374 5.5023 8.8457 5.17378 8.8457 4.79051C8.8457 4.40724 9.0374 4.10609 9.36602 3.91446L12.2137 2.27225L15.6912 0.246389C15.9925 0.0821295 16.2937 0 16.5949 0Z" fill="#674CB3"/>
  <path d="M16.5939 14.4259V1.61483C16.5939 0.875668 16.1557 0.46502 15.1973 0.54753L15.6902 0.246389C15.9914 0.0817493 16.2927 0 16.5939 0C16.8951 0 17.2238 0.0817493 17.4976 0.273385L24.3158 4.18822L29.3269 7.08975C29.9019 7.41827 30.2306 7.99318 30.2306 8.65021C30.2306 9.33425 29.9019 9.90915 29.3269 10.2377L24.3158 13.1118L19.332 16.0137C18.757 16.3423 18.0997 16.3423 17.4976 16.0137C16.9225 15.6852 16.5939 15.1103 16.5939 14.4259Z" fill="#8D67F5"/>
  <path d="M16.5939 9.85408L16.0462 9.55294L16.2927 2.81908C16.3201 1.50501 16.5939 0.519455 15.1973 0.546832C16.1557 0.464702 16.5939 0.87535 16.5939 1.61452V9.85408Z" fill="#443276"/>
  <path d="M25.4125 23.9789L21.2504 21.5702L16.8691 19.0515L21.2504 16.5059L24.0981 14.8907C24.4267 14.699 24.8101 14.699 25.1387 14.8907C25.4673 15.0549 25.659 15.3835 25.659 15.7667V23.0755C25.6316 23.404 25.5495 23.7051 25.4125 23.9789Z" fill="#B438A1"/>
  <path d="M12.926 16.7525L17.9097 19.654L24.0159 23.1852C24.6457 23.5411 25.2482 23.3768 25.659 22.5008V23.0757C25.6316 23.4042 25.5494 23.7054 25.4125 23.9791C25.2482 24.2529 25.0291 24.4719 24.7279 24.6358L17.9097 28.578L12.926 31.4522C12.3509 31.7807 11.6663 31.7807 11.0912 31.4522C10.5165 31.1236 10.1875 30.5487 10.1875 29.8921V18.3399C10.1875 17.6829 10.5165 17.1084 11.0912 16.7525C11.6663 16.424 12.3509 16.424 12.926 16.7525Z" fill="#F74DDD"/>
  <path d="M16.8691 19.0519L17.4168 18.7238L23.1126 22.3093C24.2354 22.9937 24.9748 23.7333 25.659 22.501C25.2482 23.377 24.6458 23.5416 24.0163 23.1854L21.2504 21.5705L17.9098 19.6542L16.8691 19.0519Z" fill="#76256A"/>
</svg>`;

// Chevron SVG for breadcrumb
const CHEVRON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_653_18834)">
    <path d="M13 8L17 12L13 16" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 8L11 12L7 16" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_653_18834">
      <rect width="24" height="24" fill="white"/>
    </clipPath>
  </defs>
</svg>`;

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns { meta, body } where meta is an object and body is the markdown text.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const yamlStr = match[1];
  const body = match[2].trim();
  const meta = {};

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Array: [val1, val2]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1);
      meta[key] = inner
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }

    // Boolean
    if (value === 'true') { meta[key] = true; continue; }
    if (value === 'false') { meta[key] = false; continue; }

    // Quoted string
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      meta[key] = value.slice(1, -1);
      continue;
    }

    meta[key] = value;
  }

  return { meta, body };
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildTagsHtml(tags) {
  if (!tags || tags.length === 0) return '';
  return tags.map((tag) =>
    '<div class="px-2.5 py-0.5 rounded-[50px] text-center w-fit h-fit bg-[#F5EEFE] text-[#9F7EFF] font-primary font-medium sm:text-base text-sm">' +
    tag + '</div>'
  ).join('\n          ');
}

function buildArticleJsonLd(meta, slug) {
  const url = BASE_URL + '/blog/' + slug;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description || '',
    url,
    datePublished: meta.publishedAt || '',
    author: {
      '@type': 'Organization',
      name: 'Artisans Cloud',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Artisans Cloud',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: BASE_URL + '/assets/image/favicon_io/apple-touch-icon.png',
      },
    },
  }, null, 2);
}

function buildBreadcrumbJsonLd(meta, slug) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL + '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles & Resources',
        item: BASE_URL + '/articles-and-resources',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: meta.title,
        item: BASE_URL + '/blog/' + slug,
      },
    ],
  }, null, 2);
}

function generateHtml(meta, slug, bodyHtml) {
  const title = meta.title || 'Untitled';
  const description = meta.description || '';
  const hero = meta.hero || FALLBACK_HERO;
  const heroAlt = meta.heroAlt || title;
  const ogImage = meta.hero && meta.hero.startsWith('http')
    ? meta.hero
    : FALLBACK_OG;
  const tags = meta.tags || [];
  const dateStr = meta.publishedAt ? formatDate(meta.publishedAt) : '';
  const canonicalUrl = BASE_URL + '/blog/' + slug;

  const articleJsonLd = buildArticleJsonLd(meta, slug);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(meta, slug);

  const parts = [];

  parts.push('<!DOCTYPE html>');
  parts.push('<html lang="en">');
  parts.push('<head>');
  parts.push('  <meta charset="utf-8">');
  parts.push('  <meta http-equiv="X-UA-Compatible" content="IE=edge">');
  parts.push('  <meta name="viewport" content="width=device-width, initial-scale=1">');
  parts.push('  <link rel="apple-touch-icon" sizes="180x180" href="/assets/image/favicon_io/apple-touch-icon.png">');
  parts.push('  <link rel="icon" type="image/png" sizes="32x32" href="/assets/image/favicon_io/favicon-32x32.png">');
  parts.push('  <link rel="icon" type="image/png" sizes="16x16" href="/assets/image/favicon_io/favicon-16x16.png">');
  parts.push('  <link rel="shortcut icon" href="/assets/image/favicon_io/favicon.ico" type="image/x-icon">');
  parts.push('  <link rel="manifest" href="/assets/image/favicon_io/site.webmanifest">');
  parts.push('');
  parts.push('  <title>' + title + ' | Artisans Cloud</title>');
  parts.push('  <link rel="canonical" href="' + canonicalUrl + '">');
  parts.push('  <meta name="description" content="' + description.replace(/"/g, '&quot;') + '">');
  parts.push('  <meta name="robots" content="index, follow">');
  parts.push('  <meta name="theme-color" content="#8d68f6">');
  parts.push('');
  parts.push('  <!-- Open Graph -->');
  parts.push('  <meta property="og:url" content="' + canonicalUrl + '">');
  parts.push('  <meta property="og:title" content="' + title.replace(/"/g, '&quot;') + ' | Artisans Cloud">');
  parts.push('  <meta property="og:description" content="' + description.replace(/"/g, '&quot;') + '">');
  parts.push('  <meta property="og:type" content="article">');
  parts.push('  <meta property="og:image" content="' + ogImage + '">');
  parts.push('  <meta property="og:image:width" content="1200">');
  parts.push('  <meta property="og:image:height" content="630">');
  parts.push('  <meta name="twitter:card" content="summary_large_image">');
  parts.push('  <meta name="twitter:title" content="' + title.replace(/"/g, '&quot;') + ' | Artisans Cloud">');
  parts.push('  <meta name="twitter:description" content="' + description.replace(/"/g, '&quot;') + '">');
  parts.push('  <meta name="twitter:image" content="' + ogImage + '">');
  parts.push('');
  parts.push('  <!-- Article structured data -->');
  parts.push('  <script type="application/ld+json">');
  parts.push('  ' + articleJsonLd.replace(/\n/g, '\n  '));
  parts.push('  </script>');
  parts.push('');
  parts.push('  <!-- Breadcrumb structured data -->');
  parts.push('  <script type="application/ld+json">');
  parts.push('  ' + breadcrumbJsonLd.replace(/\n/g, '\n  '));
  parts.push('  </script>');
  parts.push('');
  parts.push('  <link rel="preload" href="/assets/fonts/poppins/poppins-400-latin.woff2" as="font" type="font/woff2" crossorigin>');
  parts.push('  <link rel="preload" href="/assets/fonts/poppins/poppins-600-latin.woff2" as="font" type="font/woff2" crossorigin>');
  parts.push('  <link rel="stylesheet" href="/assets/style/output.css">');
  parts.push('</head>');
  parts.push('<body class="bg-white">');
  parts.push('  <div id="cursor" class="hidden lg:block fixed z-[1] w-36 h-36 rounded-full bg-primary blur-3xl pointer-events-none opacity-0"></div>');
  parts.push('');
  parts.push('  {{> header}}');
  parts.push('');
  parts.push('  <!-- Hero section -->');
  parts.push('  <section class="w-full h-full p-4 lg:p-5">');
  parts.push('    <div class="pt-[clamp(7rem,16.667vw-5rem,7.5rem)] min-h-full lg:min-h-[768px] h-full rounded-2xl lg:rounded-[30px] px-3 overflow-hidden bg-[url(\'/assets/image/blog-list/bloge-detail-banner.webp\')] bg-no-repeat bg-cover">');
  parts.push('      <div class="max-w-[850px] w-full mx-auto mt-[50px] pb-20 sm:pb-24 md:pb-[200px]">');
  parts.push('        <!-- Breadcrumb -->');
  parts.push('        <div class="mb-5">');
  parts.push('          <div class="flex items-center gap-1">');
  parts.push('            <a href="/articles-and-resources" class="sm:text-base text-sm text-description font-normal font-primary hover:text-heading transition-colors">Resources</a>');
  parts.push('            <span class="sm:text-base text-sm text-description font-normal font-primary">');
  parts.push('              ' + CHEVRON_SVG);
  parts.push('            </span>');
  parts.push('            <span class="sm:text-base text-sm text-heading font-normal font-primary">' + title + '</span>');
  parts.push('          </div>');
  parts.push('        </div>');
  parts.push('');
  parts.push('        <h1 class="mb-3.5 font-primary font-semibold text-2xl sm:text-4xl lg:text-[44px] xl:text-[50px] text-heading leading-[120%]">' + title + '</h1>');
  parts.push('');
  parts.push('        <!-- Tags and date -->');
  parts.push('        <div class="mb-4 sm:mb-5 flex flex-wrap gap-2 items-center">');
  parts.push('          ' + buildTagsHtml(tags));
  if (dateStr) {
    parts.push('          <div class="relative ps-3 text-description/70 lg:text-base text-sm font-normal font-primary">');
    parts.push('            <div class="absolute top-2.5 start-0 bg-description/70 h-1 w-1 rounded-full"></div>');
    parts.push('            Published ' + dateStr);
    parts.push('          </div>');
  }
  parts.push('        </div>');
  parts.push('');
  parts.push('        <!-- Author -->');
  parts.push('        <div class="flex gap-2 sm:gap-3">');
  parts.push('          <div class="max-w-[53px] min-w-[53px] h-[53px] grid place-items-center bg-[#FFFFFF] rounded-full">');
  parts.push('            ' + LOGO_SVG);
  parts.push('          </div>');
  parts.push('          <div>');
  parts.push('            <div class="sm:text-base text-sm font-medium font-primary text-heading">Artisans Cloud</div>');
  parts.push('            <div class="sm:text-base text-sm font-normal font-primary text-description">Architects of the intelligence enterprise | Unifying Data, AI &amp; Commerce</div>');
  parts.push('          </div>');
  parts.push('        </div>');
  parts.push('      </div>');
  parts.push('    </div>');
  parts.push('  </section>');
  parts.push('');
  parts.push('  <!-- Hero image -->');
  parts.push('  <div class="fade-in relative z-[2] mx-auto mb-[50px] -mt-[13%] sm:-mt-[14%] md:-mt-[150px] lg:-mt-[300px] w-[80%] max-w-[850px]">');
  parts.push('    <img src="' + hero + '" alt="' + heroAlt.replace(/"/g, '&quot;') + '" width="1200" height="600" class="h-full w-full object-cover object-top rounded-[12px]">');
  parts.push('  </div>');
  parts.push('');
  parts.push('  <!-- Article body -->');
  parts.push('  <div class="lg:pb-[100px] py-10 pt-0">');
  parts.push('    <div class="max-w-[850px] w-full px-4 xl:px-0 mx-auto">');
  parts.push('      <article class="prose-blog">');
  parts.push('        ' + bodyHtml.replace(/\n/g, '\n        '));
  parts.push('      </article>');
  parts.push('    </div>');
  parts.push('  </div>');
  parts.push('');
  parts.push('  <div class="max-w-[1240px] w-full px-4 xl:px-0 mx-auto">');
  parts.push('    <div class="bg-grey/20 mx-auto w-full h-[1px]"></div>');
  parts.push('  </div>');
  parts.push('');
  parts.push('  {{> footer}}');
  parts.push('');
  parts.push('  <script type="module" src="/assets/script/main.js"></script>');
  parts.push('</body>');
  parts.push('</html>');

  return parts.join('\n');
}

function processFile(filepath, filename) {
  const content = readFileSync(filepath, 'utf-8');
  const { meta, body } = parseFrontmatter(content);

  if (meta.draft === true) {
    console.log('Skipped (draft): ' + filename);
    return null;
  }

  const slug = meta.slug;
  if (!slug) {
    console.warn('Skipped (no slug): ' + filename);
    return null;
  }

  const bodyHtml = markdownToHtml(body);
  const html = generateHtml(meta, slug, bodyHtml);

  mkdirSync(BLOG_DIR, { recursive: true });
  const outPath = join(BLOG_DIR, slug + '.html');
  writeFileSync(outPath, html, 'utf-8');
  console.log('Written: blog/' + slug + '.html');

  return {
    title: meta.title || '',
    description: meta.description || '',
    thumbnail: meta.hero || FALLBACK_HERO,
    tags: meta.tags || [],
    url: '/blog/' + slug,
    publishedAt: meta.publishedAt || '',
    source: 'local',
  };
}

function main() {
  // Parse CLI args
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const targetSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  // If blog/ dir doesn't exist, write empty index and exit
  if (!existsSync(BLOG_DIR)) {
    console.log('blog/ directory does not exist yet. Writing empty local-articles.json.');
    writeFileSync(LOCAL_ARTICLES_PATH, '[]', 'utf-8');
    return;
  }

  const mdFiles = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    console.log('No .md files found in blog/. Writing empty local-articles.json.');
    writeFileSync(LOCAL_ARTICLES_PATH, '[]', 'utf-8');
    return;
  }

  const articles = [];

  for (const filename of mdFiles) {
    // If --slug specified, only process that one
    if (targetSlug) {
      const content = readFileSync(join(BLOG_DIR, filename), 'utf-8');
      const { meta } = parseFrontmatter(content);
      if (meta.slug !== targetSlug) continue;
    }

    const article = processFile(join(BLOG_DIR, filename), filename);
    if (article) articles.push(article);
  }

  if (!targetSlug) {
    // Sort by publishedAt descending, write full index
    articles.sort((a, b) => {
      const da = new Date(a.publishedAt).getTime() || 0;
      const db = new Date(b.publishedAt).getTime() || 0;
      return db - da;
    });

    writeFileSync(LOCAL_ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
    console.log('Written: assets/data/local-articles.json (' + articles.length + ' articles)');
  } else {
    console.log('Single-slug mode: local-articles.json not updated.');
  }
}

main();
