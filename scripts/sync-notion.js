#!/usr/bin/env node

// Fetches "Ready to Publish" articles from Notion, converts to Markdown,
// and writes them to the blog/ folder.
//
// Run manually:   node scripts/sync-notion.js
// Run in CI:      triggered by GitHub Actions on schedule or workflow_dispatch
//
// Required env vars:
//   NOTION_TOKEN         - Internal integration token (secret_...)
//   NOTION_DATABASE_ID   - The blog database ID from the Notion page URL

import { Client } from "@notionhq/client";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { blocksToMarkdown } from "./lib/notion-to-markdown.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "blog");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function getProp(page, name, type) {
  const prop = page.properties[name];
  if (!prop) return null;
  switch (type) {
    case "title":    return prop.title?.map((t) => t.plain_text).join("") || "";
    case "text":     return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":   return prop.select?.name || "";
    case "multi":    return prop.multi_select?.map((s) => s.name) || [];
    case "date":     return prop.date?.start || "";
    case "url":      return prop.url || "";
    case "checkbox": return prop.checkbox || false;
    default:         return null;
  }
}

function buildFrontmatter(meta) {
  const lines = ["---"];
  lines.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  lines.push(`slug: ${meta.slug}`);
  lines.push(`description: "${meta.description.replace(/"/g, '\\"')}"`);
  lines.push(`publishedAt: "${meta.publishedAt}"`);
  if (meta.author)       lines.push(`author: ${meta.author}`);
  if (meta.tags?.length) lines.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`);
  if (meta.hero)         lines.push(`hero: ${meta.hero}`);
  if (meta.heroAlt)      lines.push(`heroAlt: "${meta.heroAlt}"`);
  if (meta.linkedinUrl)  lines.push(`linkedinUrl: ${meta.linkedinUrl}`);
  lines.push(`featured: ${meta.featured}`);
  lines.push(`draft: false`);
  lines.push(`notionId: ${meta.notionId}`);
  lines.push("---");
  return lines.join("\n");
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
    return;
  }

  mkdirSync(BLOG_DIR, { recursive: true });

  for (const page of response.results) {
    const title       = getProp(page, "Title", "title");
    const slug        = getProp(page, "Slug", "text");
    const description = getProp(page, "Description", "text");
    const author      = getProp(page, "Author", "select");
    const tags        = getProp(page, "Tags", "multi");
    const publishedAt = getProp(page, "Published Date", "date");
    const hero        = getProp(page, "Hero Image URL", "url");
    const heroAlt     = getProp(page, "Hero Image Alt", "text");
    const featured    = getProp(page, "Featured", "checkbox");
    const linkedinUrl = getProp(page, "LinkedIn URL", "url");

    if (!slug) {
      console.warn(`Skipping "${title}": no slug set.`);
      continue;
    }

    const blocks = await fetchBlocks(page.id);
    const body   = blocksToMarkdown(blocks);

    const frontmatter = buildFrontmatter({
      title, slug, description, author, tags,
      publishedAt: publishedAt || new Date().toISOString().split("T")[0],
      hero, heroAlt, featured, linkedinUrl,
      notionId: page.id,
    });

    const filename = `${publishedAt || new Date().toISOString().split("T")[0]}-${slug}.md`;
    const filepath = join(BLOG_DIR, filename);
    writeFileSync(filepath, `${frontmatter}\n\n${body}\n`);
    console.log(`Written: blog/${filename}`);

    await markPagePublished(page.id);
    console.log(`Marked as Published in Notion: "${title}"`);
  }
}

run().catch((err) => {
  console.error("Notion sync failed:", err.message);
  process.exit(1);
});
