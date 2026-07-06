# Notion Sync History: Setup Guide

This guide explains how to set up the "Sync History" database in Notion, an audit trail that gets a new row every time the `notion-sync.yml` GitHub Action runs. It records when the sync ran, how many articles it generated, and a link to the resulting pull request, so anyone with Notion access can see sync activity without checking GitHub Actions.

This is a one-time setup step. Once the database exists and its ID is added as a repository secret, the workflow logs to it automatically on every run (success, failure, or no new articles).

---

## 1. Create the Database

1. In Notion, go to the same workspace/page where your **Blog Articles** database lives (or anywhere convenient, this can be a separate page).
2. Create a new **full-page database** and name it `Sync History`.
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

---

## 2. Share the Database with the Integration

The workflow writes to this database using the same Notion integration already used for blog articles.

1. Open the `Sync History` database.
2. Click the `•••` menu in the top right corner.
3. Under **Connections**, add the same integration you connected to the **Blog Articles** database.

If you don't already have that integration handy, it's the one configured at `https://www.notion.so/my-integrations` and referenced by the `NOTION_TOKEN` secret (see `docs/notion-blog-integration.md`).

---

## 3. Get the Database ID

1. Open the `Sync History` database as a full page in your browser.
2. Copy the ID from the URL. It's the 32-character string right before the `?v=` query parameter:
   ```
   https://www.notion.so/your-workspace/1a2b3c4d5e6f7890abcd1234ef567890?v=...
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          this part is the database ID
   ```

---

## 4. Add the GitHub Repository Secret

1. In GitHub, go to the repository's **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. Name: `NOTION_HISTORY_DATABASE_ID`
4. Value: the database ID copied in step 3.
5. Save.

No other secrets are needed. History logging reuses the existing `NOTION_TOKEN` secret already configured for the blog sync.

---

## 5. Verify It's Working

1. Manually trigger the `Sync Notion Articles` workflow from the GitHub Actions tab.
2. Once it finishes, open the `Sync History` database in Notion.
3. Confirm a new row appeared with the correct date, status, and (if articles were synced) a working PR link.

If no row appears, check the workflow run's logs for a warning from the `Log sync history to Notion` step, it prints the reason (bad token, wrong database ID, etc.) without failing the run.

---

## Developer Reference

*(This section is for developers only)*

- The logging logic lives in `scripts/log-notion-history.js`, run as the last step of `.github/workflows/notion-sync.yml` with `if: always()`.
- It derives `Status` from the sync step's outcome and whether a commit happened: `Failed` if the sync step itself failed, `No changes` if the sync succeeded but nothing was committed, otherwise `Success`.
- A failure to write to Notion (bad token, network error, wrong database ID) only logs a warning; it never fails the workflow run, since the actual sync/PR work has already completed by that point.
