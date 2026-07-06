# Notion Blog Integration: Writer's Guide

This guide explains how to write, publish, and edit blog articles on the Artisans Cloud website using Notion. 

Our system allows non-technical team members to author content in Notion and publish it directly to the live website without needing developer assistance or knowledge of code.

---

## 1. The Writer's Workflow

To publish a new article:

1. Open the **Blog Articles** database in Notion.
2. Click **New** to create a new page.
3. Fill in the required properties: **Title**, **Tags**, and **Hero Image URL**.
4. Write your article in the main body area below the properties. 
   - *Important:* The very first paragraph of your article will automatically be used as the SEO description.
   - You can use standard Notion formatting (headings, bold, lists, quotes, code).
5. Change the **Status** property from `Draft` to `Ready to Publish`.
6. **You're done!** The website syncs automatically every hour. Your article will go live at `https://www.artisanscloud.com/blog/{slug}` and the Notion status will automatically update to `Published`.

> **Note:** If you need the article to go live immediately, you can ask a developer to manually trigger the sync in GitHub.

---

## 2. Notion Database Fields

To make authoring as simple as possible, the system automates most of the SEO metadata. You only need to fill out a few fields.

| Field | Description |
|---|---|
| `Title` | The main headline of the article. *(The URL slug and image alt text are automatically generated from this).* |
| `Tags` | Select categories (e.g., AI, Retail, Commerce). |
| `Hero Image URL` | Upload an image file or paste a link to the main banner image. The system will automatically download, optimize, and save it permanently. |
| `Status` | Set to `Ready to Publish` when you want the article to go live. |

### What happens automatically?
- **URL Slug:** Auto-generated from the Title (e.g., "My Guide" becomes `my-guide`).
- **Description:** Auto-extracted from the first paragraph of your article body.
- **Published Date:** Auto-set to the day the article is synced and published.
- **Image Alt Text:** Auto-set to match the Title for SEO and accessibility.

---

## 3. Editing a Published Article

If you spot a typo or need to update an article that is already live on the website:

1. Find the published article in the Notion database.
2. Change the Status back to `Ready to Publish`.
3. Edit the content or properties.
4. The next sync run (within the hour) will overwrite the existing article on the website.

---

## 4. Best Practices & Limitations

- **Adding Images:** When adding images inside the article body, be aware that Notion uses temporary URLs. For images that need to be permanent, it is safer to ask a developer to upload the image to the website's `assets/image/blog/` folder and paste that URL into Notion.
- **Complex Layouts:** Do not use multi-column layouts in Notion. The blog only supports a clean, single-column reading experience. Stick to standard content blocks: headings, paragraphs, bullet lists, numbered lists, quotes, and images.

---

## 5. Developer Reference

*(This section is for developers only)*

### Running the Sync Locally

To test or run the Notion sync manually from your local machine, you need to set up your `.env` file with the required Notion credentials:

1. Create a `.env` file in the root of the project (if you don't have one).
2. Add the following variables:
   ```env
   NOTION_TOKEN=secret_your_internal_integration_token
   NOTION_DATABASE_ID=your_database_id_here
   ```
   *(You can find these values in the GitHub Actions Secrets or Vercel Environment Variables).*
3. Run the sync script:
   ```bash
   npm run sync:notion
   ```
   *(This will fetch the articles, generate the Markdown files, and download the images).*

### Regenerating a Single Article

```bash
node scripts/generate-blog-articles.js --slug your-article-slug
```

### Sync History Audit Trail

Every run of the `notion-sync.yml` workflow logs a row (date, article count/titles, PR link, status) to a "Sync History" database in Notion, so sync activity is visible without checking GitHub Actions. See [`docs/notion-history-setup.md`](notion-history-setup.md) for setup and how it works.
