#!/usr/bin/env node

import 'dotenv/config';

// Fetches "Ready to Publish" articles from Notion, converts to Markdown,
// and writes them to the blog/ folder.
//
// Run manually:   node scripts/sync-notion.js
// Run in CI:      triggered by GitHub Actions on schedule or workflow_dispatch
//
// Required env vars (set in .env for local dev, GitHub secrets for CI):
//   NOTION_TOKEN         - Internal integration token (secret_...)
//   NOTION_DATABASE_ID   - The blog database ID from the Notion page URL

import { Client } from "@notionhq/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { blocksToMarkdown } from "./lib/notion-to-markdown.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "blog");

// Read by log-notion-history.js. generate-blog-articles.js deletes each
// source .md right after converting it, so by the time the workflow gets to
// logging, git diff can no longer see what was synced. This file is the only
// reliable record.
const SYNC_RESULT_PATH = join(ROOT, ".notion-sync-result.json");

function writeSyncResult(titles) {
  writeFileSync(SYNC_RESULT_PATH, JSON.stringify({ count: titles.length, titles }, null, 2));
}

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  fetch: (url, init) => {
    init = init || {};
    init.headers = init.headers || {};
    if (typeof init.headers.set === 'function') {
      init.headers.set('Connection', 'close');
    } else {
      init.headers['Connection'] = 'close';
    }
    return fetch(url, init);
  }
});
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function getProp(page, name, type) {
  const prop = page.properties[name];
  if (!prop) return null;
  switch (type) {
    case "title":    return prop.title?.map((t) => t.plain_text).join("") || "";
    case "text":     return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":   return prop.select?.name || "";
    case "multi":
      if (prop.type === "multi_select") return prop.multi_select?.map((s) => s.name) || [];
      if (prop.type === "rich_text") {
        const text = prop.rich_text?.map((t) => t.plain_text).join("") || "";
        return text ? text.split(",").map(t => t.trim()).filter(Boolean) : [];
      }
      return [];
    case "date":     return prop.date?.start || "";
    case "url":      return prop.url || "";
    case "checkbox": return prop.checkbox || false;
    case "files": {
      if (prop.files?.length > 0) {
        const f = prop.files[0];
        return f.type === "external" ? (f.external?.url || "") : (f.file?.url || "");
      }
      return "";
    }
    default:         return null;
  }
}

function buildFrontmatter(meta) {
  const lines = ["---"];
  lines.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  lines.push(`slug: ${meta.slug}`);
  const safeDesc = (meta.description || "").replace(/"/g, '\\"').replace(/\n/g, ' ');
  lines.push(`description: "${safeDesc}"`);
  lines.push(`publishedAt: "${meta.publishedAt}"`);
  if (meta.tags?.length) lines.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`);
  if (meta.hero)         lines.push(`hero: ${meta.hero}`);
  if (meta.heroAlt)      lines.push(`heroAlt: "${meta.heroAlt}"`);
  lines.push(`draft: false`);
  lines.push(`notionId: ${meta.notionId}`);
  lines.push("---");
  return lines.join("\n");
}

const BLOG_IMG_DIR = join(ROOT, "public", "assets", "image", "blog");
const BLOG_IMG_PATH = "/assets/image/blog";

async function downloadHeroImage(url, slug) {
  mkdirSync(BLOG_IMG_DIR, { recursive: true });

  // Strip query params to get the real filename/extension from the S3 key
  const cleanPath = url.split("?")[0];
  const rawExt = extname(cleanPath).toLowerCase().replace(".", "");
  const validExts = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
  const ext = validExts.includes(rawExt) ? rawExt : "jpg";
  const filename = `${slug}.${ext}`;
  const destPath = join(BLOG_IMG_DIR, filename);

  if (existsSync(destPath)) {
    return `${BLOG_IMG_PATH}/${filename}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching hero image`);
  writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));

  try {
    console.log(`Optimizing image ${filename}...`);
    execSync(`npm run optimize:images -- "${destPath}"`, { stdio: "inherit", cwd: ROOT });
  } catch (err) {
    console.warn(`Failed to optimize image ${filename}: ${err.message}`);
  }

  return `${BLOG_IMG_PATH}/${filename}`;
}

async function fetchBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

async function markPagePublished(pageId) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: "Published" } },
    },
  });
}

async function run() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "Status",
      select: { equals: "Ready to Publish" },
    },
  });

  if (response.results.length === 0) {
    console.log("No articles ready to publish.");
    writeSyncResult([]);
    return;
  }

  mkdirSync(BLOG_DIR, { recursive: true });

  const syncedTitles = [];
  try {
    for (const page of response.results) {
      const title       = getProp(page, "Title", "title");
      const rawSlug     = title;
      const slug        = rawSlug ? rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : null;
      const tags        = getProp(page, "Tags", "multi");
      const publishedAt = new Date().toISOString().split("T")[0];
      const heroProp    = page.properties["Hero Image"];
      const heroRawUrl  = heroProp?.type === "files"
        ? getProp(page, "Hero Image", "files")
        : getProp(page, "Hero Image", "url");
      const heroAlt     = title;

      if (!slug) {
        console.warn(`Skipping "${title}": no slug set.`);
        continue;
      }

      // Download uploaded hero image to make the URL permanent
      let hero = heroRawUrl || "";
      if (heroProp?.type === "files" && heroRawUrl) {
        try {
          hero = await downloadHeroImage(heroRawUrl, slug);
          console.log(`Hero image saved: ${hero}`);
        } catch (err) {
          console.warn(`Could not download hero image for "${title}": ${err.message}`);
          hero = "";
        }
      }

      const blocks = await fetchBlocks(page.id);
      let body     = blocksToMarkdown(blocks);

      // Extract description from the first text paragraph
      let description = "";
      const firstParagraphBlock = blocks.find(b => b.type === "paragraph" && b.paragraph?.rich_text?.length > 0);
      if (firstParagraphBlock) {
        description = firstParagraphBlock.paragraph.rich_text.map(rt => rt.plain_text).join("");
      }

      if (!body.trim() && description) {
        body = description;
      }

      const frontmatter = buildFrontmatter({
        title, slug, description, tags,
        publishedAt,
        hero, heroAlt,
        notionId: page.id,
      });

      const filename = `${publishedAt}-${slug}.md`;
      const filepath = join(BLOG_DIR, filename);
      writeFileSync(filepath, `${frontmatter}\n\n${body}\n`);
      console.log(`Written: blog/${filename}`);
      syncedTitles.push(title);

      try {
        await markPagePublished(page.id);
        console.log(`Marked as Published in Notion: "${title}"`);
      } catch (err) {
        console.warn(`Could not mark "${title}" as published in Notion: ${err.message}`);
      }
    }
  } finally {
    writeSyncResult(syncedTitles);
  }
}

run().catch((err) => {
  console.error("Notion sync failed:", err.message);
  process.exit(1);
});
