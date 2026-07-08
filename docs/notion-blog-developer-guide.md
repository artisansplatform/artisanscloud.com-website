# Notion Blog Integration: Developer Reference

Technical companion to the [Notion Blog Integration Guide](notion-blog-integration.md). That guide covers the click-by-click setup and the writer workflow. This one covers the code: how the sync runs, what the scripts do, and how to run and debug it locally.

## How the pipeline works

Publishing an article is a chain of steps kicked off manually from GitHub Actions:

1. A person sets an article's `Status` to `Ready to Publish` in the Notion **Blog Articles** database.
2. Someone triggers the **Sync Notion Articles** workflow (`.github/workflows/notion-sync.yml`) from the Actions tab. It only runs on `workflow_dispatch`, there is no cron trigger.
3. The workflow checks out `main`, creates a branch named `notion-sync/<date>-<run-number>`, and runs the sync.
4. `scripts/sync-notion.js` fetches every `Ready to Publish` article, writes Markdown into `blog/`, downloads and stores hero images, and flips each synced article's Notion `Status` to `Published`.
5. `scripts/generate-blog-articles.js` turns the Markdown into static HTML pages.
6. `scripts/optimize-images.js` re-encodes any newly downloaded blog images.
7. The workflow commits `blog/`, `assets/data/local-articles.json`, and `public/assets/image/blog/`, opens a PR against `main`, and (with `if: always()`) logs the run to the Sync History database via `scripts/log-notion-history.js`.

The articles go live once that PR is merged and Vercel deploys.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `NOTION_TOKEN` | sync + history | Internal integration secret. Same token for both databases. |
| `NOTION_DATABASE_ID` | `sync-notion.js` | The Blog Articles database ID. |
| `NOTION_HISTORY_DATABASE_ID` | `log-notion-history.js` | The Sync History database ID. Optional; if unset, history logging is skipped. |

In CI these are GitHub Actions repository secrets. Locally they come from a `.env` file in the project root. All three are listed in `.env.example`.

## Running the sync locally

1. Create a `.env` file in the project root if you don't have one.
2. Add the credentials:
   ```env
   NOTION_TOKEN=secret_your_internal_integration_token
   NOTION_DATABASE_ID=your_blog_database_id
   NOTION_HISTORY_DATABASE_ID=your_history_database_id
   ```
   You can copy these from the GitHub Actions secrets or Vercel environment variables.
3. Run the sync:
   ```bash
   npm run sync:notion
   ```
   This fetches the `Ready to Publish` articles, writes the Markdown files, downloads the images, and (because it hits the live Notion database) flips their `Status` to `Published`. Be aware you are mutating real Notion data when you run this against the production database.
4. Generate the HTML from the Markdown:
   ```bash
   npm run generate:blog
   ```

## Regenerating a single article

To rebuild the HTML for one article without touching Notion:

```bash
node scripts/generate-blog-articles.js --slug your-article-slug
```

## Sync History logging

- Logic lives in `scripts/log-notion-history.js`, run as the last step of `notion-sync.yml` with `if: always()` so it records failed runs too.
- It derives `Status` from the sync step's outcome and whether a commit happened:
  - `Failed` if the sync step itself failed.
  - `No changes` if the sync succeeded but nothing was committed.
  - `Success` otherwise.
- Writing to Notion is best-effort. A bad token, network error, or wrong database ID only logs a warning; it never fails the workflow, since the sync and PR work is already done by that point.
- If `NOTION_HISTORY_DATABASE_ID` is not set, the step no-ops.

## Related files

| File | Role |
|---|---|
| `.github/workflows/notion-sync.yml` | Manual workflow that runs the whole pipeline and opens the PR. |
| `scripts/sync-notion.js` | Fetches articles from Notion, writes Markdown, downloads images, updates Status. |
| `scripts/generate-blog-articles.js` | Renders Markdown into static blog HTML. |
| `scripts/log-notion-history.js` | Logs each run to the Sync History database. |
| `.env.example` | Lists the three Notion environment variables. |
