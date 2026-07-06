#!/usr/bin/env node

import "dotenv/config";

// Logs one row to the "Sync History" Notion database recording the outcome
// of a notion-sync.yml run: when it ran, how many articles were synced, and
// a link to the resulting PR (if any).
//
// Run in CI: last step of .github/workflows/notion-sync.yml, with `if: always()`.
// A failure here (bad token, wrong database ID, network error) only logs a
// warning; it must never fail the workflow, since the actual sync/PR work
// has already completed by this point.
//
// Required env vars:
//   NOTION_TOKEN                - same integration token used by sync-notion.js
//   NOTION_HISTORY_DATABASE_ID  - the "Sync History" database ID
//
// Article count/titles are read from .notion-sync-result.json, written by
// sync-notion.js itself. generate-blog-articles.js deletes each source .md
// right after converting it, so by the time this step runs, git diff can no
// longer see what was synced.
//
// Run context env vars (set by the workflow from earlier step outputs):
//   SYNC_OUTCOME  - outcome of the "Run Notion sync" step ("success", "failure", ...)
//   CHANGED       - "true" if the sync produced a commit, "false" otherwise
//   PR_URL        - URL of the created pull request, blank if none
//
// Outside GitHub Actions (e.g. `npm run log:notion-history` for a manual
// smoke test), SYNC_OUTCOME/CHANGED don't exist since there's no separate
// sync step or commit step to report them. In that case, treat the sync as
// successful (you wouldn't have gotten this far otherwise) and derive
// "changed" from whether the result file shows any articles were synced.

import { Client } from "@notionhq/client";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SYNC_RESULT_PATH = join(ROOT, ".notion-sync-result.json");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_HISTORY_DATABASE_ID;
const IS_CI = process.env.GITHUB_ACTIONS === "true";

function readSyncResult() {
  if (!existsSync(SYNC_RESULT_PATH)) return { count: 0, titles: [] };
  try {
    const parsed = JSON.parse(readFileSync(SYNC_RESULT_PATH, "utf8"));
    return { count: parsed.count || 0, titles: parsed.titles || [] };
  } catch {
    return { count: 0, titles: [] };
  }
}

function deriveStatus(articlesSynced) {
  const syncOutcome = process.env.SYNC_OUTCOME || (IS_CI ? undefined : "success");
  if (syncOutcome !== "success") return "Failed";
  const changed = IS_CI ? process.env.CHANGED === "true" : articlesSynced > 0;
  return changed ? "Success" : "No changes";
}

function formatRunDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getUTCFullYear();
  const mo = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const mi = pad(date.getUTCMinutes());
  return `${y}-${mo}-${d} ${h}:${mi} UTC`;
}

async function run() {
  if (!NOTION_TOKEN || !DATABASE_ID) {
    console.warn(
      "Skipping sync history log: NOTION_TOKEN or NOTION_HISTORY_DATABASE_ID is not set."
    );
    return;
  }

  const notion = new Client({ auth: NOTION_TOKEN });

  const now = new Date();
  const { count: articlesSynced, titles: titleList } = readSyncResult();
  const status = deriveStatus(articlesSynced);
  const titles = titleList.join("; ");
  const prUrl = process.env.PR_URL || "";

  const properties = {
    Name: { title: [{ text: { content: `Sync ${formatRunDate(now)}` } }] },
    "Run Date": { date: { start: now.toISOString() } },
    "Articles Synced": { number: articlesSynced },
    Titles: { rich_text: titles ? [{ text: { content: titles } }] : [] },
    Status: { select: { name: status } },
  };

  if (prUrl) {
    properties["PR Link"] = { url: prUrl };
  }

  await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties,
  });

  console.log(`Logged sync history: ${status}, ${articlesSynced} article(s).`);
}

run().catch((err) => {
  console.warn(`Could not log sync history to Notion: ${err.message}`);
});
