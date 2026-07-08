# Notion Blog Integration: Complete Guide

This guide explains how the Artisans Cloud blog system connects to Notion, from the very first setup step to writing and publishing an article.

No coding knowledge is required for any step in this guide. A couple of steps happen inside GitHub instead of Notion (adding secrets), but they are still just clicking buttons and pasting text, no code involved.

**Already set up and just want to write an article?** Skip straight to [Part 2: Writing and Publishing Articles](#part-2-writing-and-publishing-articles).

---

## Overview

There are two Notion databases involved:

1. **Blog Articles**: where writers create and manage article content. This is the one you'll use every day.
2. **Sync History**: an optional log that records every sync run (date, articles synced, success or failure). Nice to have, not required for publishing.

Both databases talk to the website through a single Notion "integration," which is really just a secure connection that lets Notion and the website's code exchange information. You only set this up once.

---

## Part 1: One-Time Setup

Do this section once, when connecting Notion to the website for the first time. If someone already did this for your team, skip to [Part 2](#part-2-writing-and-publishing-articles).

You will need:
- Access to the Notion workspace where the blog content should live.
- Access to the GitHub repository's **Settings** tab (ask a developer if you don't have this).

### 1.1 Create the Notion Integration (the "connection")

The integration is what lets the website's sync script read and update pages in your Notion database. Think of it as a dedicated login just for this automation.

1. While logged into the Notion workspace, open **[notion.so/my-integrations](https://www.notion.so/my-integrations)** in your browser.
2. Click **New integration**.
3. Give it a clear name, for example `Artisans Cloud Blog Sync`.
4. Under **Associated workspace**, choose the workspace that contains (or will contain) your Blog Articles database.
5. Under **Capabilities**, make sure these are turned on:
   - Read content
   - Update content
   - Insert content
6. Click **Save**.
7. On the next screen, find **Internal Integration Secret** and click **Show**, then **Copy**. This is a long string starting with `secret_` or `ntn_`.
8. Save this value somewhere safe for a moment, you'll need it in [1.5](#15-add-the-secrets-to-github). Do not paste it into Notion itself or share it publicly, anyone with this value can read and edit your database.

### 1.2 Create the Blog Articles Database

1. In Notion, open the sidebar and click **+ New page** (or **Add a page**) wherever you want the database to live, this can be a top-level page or inside a folder your team already uses.
2. Type a title for the page, for example `Blog Articles`.
3. Press Enter, then type `/table` and choose **Table - Full page** from the menu. This creates a full-page database rather than a small inline one.
4. Notion adds a default title column called **Name**. Click on the **Name** column header, choose **Edit property**, and rename it to **Title**. This exact name matters, the sync script looks for a property called `Title`.
5. Add the remaining properties by clicking the **+** button to the right of the last column header. Add each one below with the exact name and type shown:

| Property name (exact) | Property type | Setup notes |
|---|---|---|
| `Title` | Title | Renamed from the default `Name` column in step 4. |
| `Tags` | Multi-select | Add a few starter options, e.g. `AI`, `Retail`, `Commerce`. You can add more later while writing. |
| `Hero Image URL` | Files & media | Lets writers either upload an image file directly or paste an external image link. |
| `Status` | Select | Add exactly these three options: `Draft`, `Ready to Publish`, `Published`. Spelling and capitalization must match exactly, the sync script checks for these exact words. |

   Tip: color-code the `Status` options (e.g. gray for `Draft`, yellow for `Ready to Publish`, green for `Published`) so the table is easy to scan at a glance.

### 1.3 Connect the Database to Your Integration

Creating the integration and creating the database does not automatically link them, you need to explicitly share the database with the integration.

1. Open the **Blog Articles** database as a full page.
2. Click the **•••** menu in the top right corner of the page.
3. Scroll to **Connections** and click **Connect to**.
4. Search for the integration name you chose in step 1.1 (e.g. `Artisans Cloud Blog Sync`) and click it.
5. Confirm the connection when prompted.

If you skip this step, the sync script will not be able to see the database at all, even with a valid token.

### 1.4 Get the Database ID

The sync script needs to know exactly which database to read from. This is done with a database ID, a long string of letters and numbers hidden in the page's URL.

1. With the **Blog Articles** database open as a full page in your browser, look at the address bar.
2. The URL looks something like this:
   ```
   https://www.notion.so/your-workspace/1a2b3c4d5e6f7890abcd1234ef567890?v=...
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          this part is the database ID
   ```
3. Copy the 32-character string that appears right before the `?v=` part. That is your database ID.

### 1.5 Add the Secrets to GitHub

The website's automation lives in GitHub, so the token and database ID from the previous steps need to be stored there as "repository secrets," a secure, hidden storage area that only the automation can read.

1. In GitHub, open the repository and go to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. Add the first secret:
   - Name: `NOTION_TOKEN`
   - Value: the Internal Integration Secret you copied in [1.1](#11-create-the-notion-integration-the-connection)
   - Click **Add secret**.
4. Click **New repository secret** again and add the second secret:
   - Name: `NOTION_DATABASE_ID`
   - Value: the database ID you copied in [1.4](#14-get-the-database-id)
   - Click **Add secret**.

### 1.6 Test the Connection

1. In GitHub, go to the **Actions** tab.
2. In the left sidebar, click **Sync Notion Articles**.
3. Click **Run workflow**, then confirm.
4. Wait for the run to finish (usually under a minute). A green checkmark means success.
5. If the run fails, click into it to read the error message. The most common causes are a missing connection (revisit [1.3](#13-connect-the-database-to-your-integration)) or a typo in one of the secrets (revisit [1.5](#15-add-the-secrets-to-github)).

Setup is complete. From here on, publishing an article only requires Notion, no GitHub access needed. See [Part 2](#part-2-writing-and-publishing-articles).

Optionally, you can also set up the Sync History database for extra visibility into every sync run, see [Part 6](#part-6-sync-history-audit-trail-optional).

---

## Part 2: Writing and Publishing Articles

This is the day-to-day workflow once setup is complete.

1. Open the **Blog Articles** database in Notion.
2. Click **New** to create a new page.
3. Fill in the required properties: **Title**, **Tags**, and **Hero Image URL**.
4. Write your article in the main body area below the properties.
   - *Important:* The very first paragraph of your article will automatically be used as the SEO description.
   - You can use standard Notion formatting (headings, bold, lists, quotes, code).
5. Change the **Status** property from `Draft` to `Ready to Publish`.
6. **You're done!** Ask a developer to trigger the sync (see [1.6 Test the Connection](#16-test-the-connection) for the exact steps, it's the same **Run workflow** button). Once the sync finishes, your article goes live at `https://www.artisanscloud.com/blog/{slug}` and the Notion **Status** automatically updates to `Published`.

> **Note:** The sync only runs when someone manually clicks **Run workflow** in GitHub Actions, it does not run automatically on a schedule. If you need an article published, message a developer or teammate with GitHub access after setting the Status to `Ready to Publish`.

---

## Part 3: Notion Database Fields Reference

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

## Part 4: Editing a Published Article

If you spot a typo or need to update an article that is already live on the website:

1. Find the published article in the Notion database.
2. Change the Status back to `Ready to Publish`.
3. Edit the content or properties.
4. Ask a developer to trigger the sync again (same **Run workflow** step as publishing). It will overwrite the existing article on the website.

---

## Part 5: Best Practices & Limitations

- **Adding Images:** When adding images inside the article body, be aware that Notion uses temporary URLs. For images that need to be permanent, it is safer to ask a developer to upload the image to the website's `assets/image/blog/` folder and paste that URL into Notion.
- **Complex Layouts:** Do not use multi-column layouts in Notion. The blog only supports a clean, single-column reading experience. Stick to standard content blocks: headings, paragraphs, bullet lists, numbered lists, quotes, and images.

---

## Part 6: Sync History Audit Trail (Optional)

Every run of the `notion-sync.yml` workflow can log a row (date, article count/titles, PR link, status) to a separate "Sync History" database in Notion, so sync activity is visible to anyone with Notion access without checking GitHub Actions.

This is a one-time setup step, similar to Part 1. It reuses the same integration you already created, no need to create a second one.

### 6.1 Create the Database

1. In Notion, go to the same workspace/page where your **Blog Articles** database lives (or anywhere convenient, this can be a separate page).
2. Create a new **full-page database** and name it `Sync History` (same steps as [1.2](#12-create-the-blog-articles-database), steps 1-3).
3. Add the following properties (columns). Notion adds a default `Name` title property automatically, keep it, it will hold a label like `Sync 2026-07-06 14:32 UTC`.

| Property name | Property type | Notes |
|---|---|---|
| `Name` | Title | Default property, keep as is. |
| `Run Date` | Date | Include time in the date format if you want to see it in the table view. |
| `Articles Synced` | Number | Count of articles generated in that run. |
| `Titles` | Text | Synced article titles, separated by `; `. Blank if none. |
| `PR Link` | URL | Link to the GitHub PR created by that run. Blank if nothing was synced. |
| `Status` | Select | Add three options: `Success`, `Failed`, `No changes`. |

Tip: color-code the `Status` options (e.g. green for `Success`, red for `Failed`, gray for `No changes`) so you can scan the table at a glance.

### 6.2 Share the Database with the Integration

1. Open the `Sync History` database.
2. Click the **•••** menu in the top right corner.
3. Under **Connections**, click **Connect to** and add the same integration you connected to the **Blog Articles** database in [1.3](#13-connect-the-database-to-your-integration).

### 6.3 Get the Database ID

Same process as [1.4](#14-get-the-database-id): open the `Sync History` database as a full page and copy the 32-character ID from the URL, right before the `?v=` part.

### 6.4 Add the GitHub Repository Secret

1. In GitHub, go to the repository's **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. Name: `NOTION_HISTORY_DATABASE_ID`
4. Value: the database ID copied in 6.3.
5. Save.

No other secrets are needed. History logging reuses the existing `NOTION_TOKEN` secret already configured in [1.5](#15-add-the-secrets-to-github).

### 6.5 Verify It's Working

1. Manually trigger the `Sync Notion Articles` workflow from the GitHub Actions tab (same as [1.6](#16-test-the-connection)).
2. Once it finishes, open the `Sync History` database in Notion.
3. Confirm a new row appeared with the correct date, status, and (if articles were synced) a working PR link.

If no row appears, check the workflow run's logs for a warning from the `Log sync history to Notion` step, it prints the reason (bad token, wrong database ID, etc.) without failing the run.

---

## Part 7: Developer Reference

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

### Sync History Logging

- The logging logic lives in `scripts/log-notion-history.js`, run as the last step of `.github/workflows/notion-sync.yml` with `if: always()`.
- It derives `Status` from the sync step's outcome and whether a commit happened: `Failed` if the sync step itself failed, `No changes` if the sync succeeded but nothing was committed, otherwise `Success`.
- A failure to write to Notion (bad token, network error, wrong database ID) only logs a warning; it never fails the workflow run, since the actual sync/PR work has already completed by that point.
- The `notion-sync.yml` workflow triggers only on `workflow_dispatch` (manual runs from the Actions tab), there is no scheduled/cron trigger configured.
- Setup steps for both Notion databases are in [Part 1](#part-1-one-time-setup) (Blog Articles) and [Part 6](#part-6-sync-history-audit-trail-optional) (Sync History) above.
