# Notion Blog Integration: Implementation Plan

## What We Are Building

A system where a non-technical team member writes a blog article in Notion, marks it as
"Ready to Publish", and a GitHub Action automatically picks it up, converts it to Markdown,
commits it to the repository, and Vercel rebuilds the site. The article goes live with full
SEO, its own URL, and structured data, with no developer involvement needed after the
initial setup.

---

## How It Works End-to-End

```
Writer creates a page in Notion
    └── Fills in: Title, Description, Tags, Author, Hero Image, Body
         └── Changes Status to "Ready to Publish"
              └── GitHub Action runs (on schedule or triggered manually)
                   └── Fetches all "Ready to Publish" pages from Notion API
                        └── Converts each page to a Markdown .md file
                             └── Commits the file to blog/ folder in GitHub
                                  └── Vercel detects the commit and rebuilds
                                       └── Article is live at /blog/{slug} in ~90 seconds
                                            └── Status updated to "Published" in Notion
```

---

## Prerequisites

Before starting:

- A Notion account with access to the workspace
- A Notion database created for blog articles (covered in Phase 1)
- A Notion integration token (covered in Phase 1)
- The Markdown blog pipeline from `docs/seo-blog-strategy.md` must be built first.
  The Notion sync only writes `.md` files. Those files need the generator script
  (`scripts/generate-blog-articles.js`) to turn them into HTML pages.

---

## Phase 1: Notion Setup (No Code, ~30 Minutes)

### Step 1: Create the Notion Database

In your Notion workspace, create a new database called **Blog Articles**.
Add the following properties:

| Property Name | Type | Purpose |
|---|---|---|
| `Title` | Title (default) | Article headline |
| `Slug` | Text | URL path, e.g. `unified-commerce-guide` |
| `Description` | Text | One or two sentences for SEO meta description |
| `Author` | Select | Team member slug matching `team-members.json` |
| `Tags` | Multi-select | e.g. AI, Retail, Commerce, Data, Enterprise |
| `Published Date` | Date | The date to show on the article |
| `Hero Image URL` | URL | Link to the hero image |
| `Hero Image Alt` | Text | Alt text for the hero image |
| `Status` | Select | Draft, Ready to Publish, Published, Archived |
| `Featured` | Checkbox | Whether to feature this article |
| `LinkedIn URL` | URL | Optional, link to original LinkedIn version |

The **page body** (the content area below the properties) is where the writer types
the full article. Notion's rich text editor (headings, bold, lists, images, quotes)
maps cleanly to Markdown.

### Step 2: Create a Notion Integration

1. Go to `https://www.notion.so/my-integrations`
2. Click **New integration**
3. Name it: `Artisans Cloud Blog Sync`
4. Select your workspace
5. Set capabilities: Read content, No user info needed
6. Click **Submit** and copy the **Internal Integration Token** (starts with `secret_`)

### Step 3: Share the Database with the Integration

1. Open the Blog Articles database in Notion
2. Click **...** (top right) then **Add connections**
3. Search for `Artisans Cloud Blog Sync` and connect it

The integration can now read pages from this database.

---

## Phase 2: The Sync Script (~2-3 Hours of Dev Work)

### New Files to Create

```
scripts/
  sync-notion.js          Main sync script
  lib/
    notion-to-markdown.js Converts Notion blocks to Markdown text
```

### Step 1: Install Dependencies

```bash
npm install --save-dev @notionhq/client
```

The official Notion SDK. No other new dependencies needed.

### Step 2: Create the Notion to Markdown Converter

Create `scripts/lib/notion-to-markdown.js`:

This file handles converting Notion's block format into clean Markdown text.

Notion stores content as an array of blocks (paragraph, heading_1, heading_2,
bulleted_list_item, numbered_list_item, quote, code, image, divider, etc.).
Each block type maps to a Markdown equivalent:

| Notion Block | Markdown Output |
|---|---|
| `paragraph` | Plain text paragraph |
| `heading_1` | `# Heading` |
| `heading_2` | `## Heading` |
| `heading_3` | `### Heading` |
| `bulleted_list_item` | `- item` |
| `numbered_list_item` | `1. item` |
| `quote` | `> text` |
| `code` | ` ```language ... ``` ` |
| `image` | `![alt](url)` |
| `divider` | `---` |
| `callout` | `> **Note:** text` |

Rich text annotations (bold, italic, inline code, links) are also converted:
- Bold: `**text**`
- Italic: `_text_`
- Inline code: `` `text` ``
- Link: `[text](url)`

```js
// scripts/lib/notion-to-markdown.js

export function richTextToMarkdown(richTexts) {
  return richTexts
    .map((rt) => {
      let text = rt.plain_text;
      if (rt.href) text = `[${text}](${rt.href})`;
      if (rt.annotations.code) text = `\`${text}\``;
      if (rt.annotations.bold) text = `**${text}**`;
      if (rt.annotations.italic) text = `_${text}_`;
      if (rt.annotations.strikethrough) text = `~~${text}~~`;
      return text;
    })
    .join("");
}

export function blocksToMarkdown(blocks) {
  const lines = [];
  let numberedIndex = 1;

  for (const block of blocks) {
    const type = block.type;
    const data = block[type];

    if (type !== "numbered_list_item") numberedIndex = 1;

    switch (type) {
      case "paragraph":
        lines.push(richTextToMarkdown(data.rich_text) || "");
        lines.push("");
        break;
      case "heading_1":
        lines.push(`# ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "heading_2":
        lines.push(`## ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "heading_3":
        lines.push(`### ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "bulleted_list_item":
        lines.push(`- ${richTextToMarkdown(data.rich_text)}`);
        break;
      case "numbered_list_item":
        lines.push(`${numberedIndex}. ${richTextToMarkdown(data.rich_text)}`);
        numberedIndex++;
        break;
      case "quote":
        lines.push(`> ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "code":
        lines.push(`\`\`\`${data.language || ""}`);
        lines.push(richTextToMarkdown(data.rich_text));
        lines.push("```");
        lines.push("");
        break;
      case "image": {
        const url = data.type === "external" ? data.external.url : data.file.url;
        const caption = data.caption?.length ? richTextToMarkdown(data.caption) : "";
        lines.push(`![${caption}](${url})`);
        lines.push("");
        break;
      }
      case "divider":
        lines.push("---");
        lines.push("");
        break;
      case "callout": {
        const emoji = data.icon?.emoji ? `${data.icon.emoji} ` : "";
        lines.push(`> ${emoji}${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      }
      default:
        break;
    }
  }

  return lines.join("\n").trim();
}
```

### Step 3: Create the Main Sync Script

Create `scripts/sync-notion.js`:

```js
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
    case "title":   return prop.title?.map((t) => t.plain_text).join("") || "";
    case "text":    return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":  return prop.select?.name || "";
    case "multi":   return prop.multi_select?.map((s) => s.name) || [];
    case "date":    return prop.date?.start || "";
    case "url":     return prop.url || "";
    case "checkbox":return prop.checkbox || false;
    default:        return null;
  }
}

function buildFrontmatter(meta) {
  const lines = ["---"];
  lines.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  lines.push(`slug: ${meta.slug}`);
  lines.push(`description: "${meta.description.replace(/"/g, '\\"')}"`);
  lines.push(`publishedAt: "${meta.publishedAt}"`);
  if (meta.author)    lines.push(`author: ${meta.author}`);
  if (meta.tags?.length) lines.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`);
  if (meta.hero)      lines.push(`hero: ${meta.hero}`);
  if (meta.heroAlt)   lines.push(`heroAlt: "${meta.heroAlt}"`);
  if (meta.linkedinUrl) lines.push(`linkedinUrl: ${meta.linkedinUrl}`);
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
    const title   = getProp(page, "Title", "title");
    const slug    = getProp(page, "Slug", "text");
    const description = getProp(page, "Description", "text");
    const author  = getProp(page, "Author", "select");
    const tags    = getProp(page, "Tags", "multi");
    const publishedAt = getProp(page, "Published Date", "date");
    const hero    = getProp(page, "Hero Image URL", "url");
    const heroAlt = getProp(page, "Hero Image Alt", "text");
    const featured = getProp(page, "Featured", "checkbox");
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
```

### Step 4: Add npm Script

In `package.json`, add:

```json
"sync:notion": "node scripts/sync-notion.js"
```

---

## Phase 3: GitHub Actions Workflow (~30 Minutes)

This is what runs the sync automatically so no developer needs to trigger it manually.

### Create `.github/workflows/notion-sync.yml`

```yaml
name: Sync Notion Articles

on:
  schedule:
    - cron: "0 * * * *"   # runs every hour
  workflow_dispatch:        # also allows manual trigger from GitHub Actions tab

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run Notion sync
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
        run: node scripts/sync-notion.js

      - name: Commit new articles if any
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add blog/
          git diff --staged --quiet || git commit -m "chore: sync articles from Notion"
          git push
```

**What this does:**
- Runs every hour automatically
- Can also be triggered instantly from the GitHub Actions tab
- Pulls new articles from Notion, writes `.md` files, commits to `blog/`
- If no new articles, the workflow exits cleanly without making a commit
- The `git push` triggers Vercel to rebuild and deploy

### Add Secrets to GitHub

Go to the repo on GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these two secrets:

| Secret Name | Value |
|---|---|
| `NOTION_TOKEN` | The integration token from Phase 1 Step 2 (starts with `secret_`) |
| `NOTION_DATABASE_ID` | Found in the Notion database URL: `notion.so/workspace/THIS-PART?v=...` |

---

## Phase 4: Vercel Environment Variables (~5 Minutes)

If you also want to run `npm run sync:notion` locally during development, add the same
two variables to your local `.env` file and to Vercel's environment variables dashboard:

```
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

In Vercel: **Project Settings** → **Environment Variables** → add both for Production,
Preview, and Development.

---

## Complete File Changes Summary

| File | Action | Purpose |
|---|---|---|
| `scripts/sync-notion.js` | Create | Main sync script |
| `scripts/lib/notion-to-markdown.js` | Create | Converts Notion blocks to Markdown |
| `.github/workflows/notion-sync.yml` | Create | Runs sync on schedule and on-demand |
| `package.json` | Update | Add `sync:notion` script |
| `blog/*.md` | Auto-generated | Written by the sync script, not by hand |

The blog pipeline files from `docs/seo-blog-strategy.md` are also required:

| File | Action | Purpose |
|---|---|---|
| `scripts/generate-blog-articles.js` | Create | Turns `.md` files into HTML pages |
| `scripts/lib/blog-articles.js` | Create | Shared Markdown file loader |
| `scripts/lib/markdown.js` | Create | Markdown to HTML converter |
| `assets/data/local-articles.json` | Auto-generated | Article list for the frontend |

---

## The Writer's Workflow (After Setup)

This is the only thing the non-technical writer needs to know:

1. Open the **Blog Articles** database in Notion
2. Click **New** to create a new page
3. Fill in the properties on the right: Title, Slug, Description, Author, Tags, Published Date
4. Write the article in the body area (just like writing a normal Notion page)
5. Change **Status** from `Draft` to `Ready to Publish`
6. The article will be live on the site within the next hour (or immediately if someone
   triggers the workflow manually from GitHub Actions)

That is the entire workflow. The writer never touches GitHub, never writes Markdown
syntax, and never needs to contact a developer.

---

## Handling Updates to Published Articles

If a writer wants to edit a published article:

1. Find it in the Notion database
2. Change Status back to `Ready to Publish`
3. Edit the content
4. The next sync run will overwrite the existing `.md` file (matched by slug)
5. Vercel rebuilds, the updated article goes live

The `notionId` field in the frontmatter is used to match pages across syncs so
existing files are updated rather than duplicated.

---

## Limitations and Trade-offs

- **Sync delay:** Articles go live within an hour (or instantly via manual trigger).
  Not real-time, but acceptable for a blog.
- **Images:** Images embedded in Notion pages use Notion's CDN URLs, which expire
  after a period of time. For permanent images, writers should upload them to
  `assets/image/blog/` and paste the URL into the Hero Image URL field instead
  of embedding them inline in the Notion page body.
- **Notion is an external dependency:** If Notion has downtime, the sync will fail
  gracefully (no articles deleted, no site broken). New articles just won't publish
  until Notion is back.
- **Complex layouts:** Multi-column layouts in Notion do not have a clean Markdown
  equivalent and are flattened to single-column. Writers should stick to standard
  content blocks (headings, paragraphs, lists, images, quotes, code).

---

## Verification Checklist After Setup

- [ ] Notion database created with all required properties
- [ ] Integration token generated and database shared with the integration
- [ ] `scripts/sync-notion.js` runs locally without errors: `npm run sync:notion`
- [ ] A test article in Notion with Status "Ready to Publish" produces a `.md` file
      in `blog/` after running the script
- [ ] `npm run build` completes and `dist/blog/{slug}.html` exists
- [ ] Article appears at `http://localhost:3000/blog/{slug}` with correct content
- [ ] GitHub Actions secrets `NOTION_TOKEN` and `NOTION_DATABASE_ID` are set
- [ ] GitHub Actions workflow runs successfully (check the Actions tab)
- [ ] A commit from the workflow triggers a Vercel deployment
- [ ] Article is live on the production site
- [ ] Status in Notion changed to "Published" automatically

---

## Open Questions Before Implementation

1. Does the team already use Notion, or would this be a new tool for them?
2. Who are the authors? Should the Author field be a free-text field or a fixed
   list matching the existing `team-members.json` slugs?
3. Is the one-hour sync delay acceptable, or is a manual trigger button needed?
4. Should the sync also handle article deletions (if a page is Archived in Notion,
   delete the `.md` file from the repo)?
