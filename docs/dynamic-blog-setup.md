# Dynamic Blog Articles - Setup & Operations Guide

This guide covers the complete setup, operation, and troubleshooting of the dynamic blog articles system that fetches LinkedIn articles and displays them on the website.

## Prerequisites

Before starting, you need:

- A **Vercel** account with this project deployed
- A **LinkedIn Developer Application** with access to the Pages API
- The following from your LinkedIn app:
  - Client ID
  - Client Secret
  - Access Token (obtained via OAuth flow)
  - Refresh Token (obtained via OAuth flow)
  - Organization ID (numeric, found in LinkedIn admin URL)

## Setup Steps

### Step 1: Create the Vercel Blob Store

The system caches LinkedIn articles in Vercel Blob storage. This **must** be provisioned before the API functions will work.

1. Go to your **Vercel project dashboard**
2. Navigate to the **Storage** tab
3. Click **Create** → select **Blob**
4. Name it (e.g., `articles-cache`)
5. Click **Create**

This automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable to your project. Without this, any API call to `/api/articles` or `/api/cron/fetch-articles` will fail with:

```
Error: Vercel Blob: No token found. Either configure the `BLOB_READ_WRITE_TOKEN`
environment variable, or pass a `token` option to your calls.
```

### Step 2: Set Environment Variables

Go to **Vercel Dashboard** → **Settings** → **Environment Variables** and add each of these:

| Variable                 | Value                           | Notes                                                                    |
| ------------------------ | ------------------------------- | ------------------------------------------------------------------------ |
| `LINKEDIN_CLIENT_ID`     | Your LinkedIn app Client ID     | Found in LinkedIn Developer Portal → Your App → Auth                     |
| `LINKEDIN_CLIENT_SECRET` | Your LinkedIn app Client Secret | Same location as above                                                   |
| `LINKEDIN_ACCESS_TOKEN`  | OAuth access token              | 60-day expiry, auto-refreshed by the system                              |
| `LINKEDIN_REFRESH_TOKEN` | OAuth refresh token             | 365-day expiry, must be manually renewed                                 |
| `LINKEDIN_ORG_ID`        | Your LinkedIn Organization ID   | Numeric ID from LinkedIn company admin URL                               |
| `CRON_SECRET`            | Any random secret string        | Used to authenticate cron endpoint; generate with `openssl rand -hex 32` |
| `BLOB_READ_WRITE_TOKEN`  | _(auto-set)_                    | Already present if Blob store was created in Step 1                      |

Ensure all variables are enabled for **Production** (and optionally Preview/Development).

### Step 3: Deploy

After setting all environment variables, **redeploy** the project so the new env vars take effect:

```bash
# Via Vercel CLI
vercel --prod

# Or push a commit to main branch (auto-deploys)
```

### Step 4: Trigger the First Article Fetch

The daily cron runs at 6:00 AM UTC automatically. To populate the cache immediately after setup:

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/fetch-articles" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_VALUE"
```

Replace `your-domain.vercel.app` with your actual Vercel URL and `YOUR_CRON_SECRET_VALUE` with the value you set for `CRON_SECRET`.

Expected response on success:

```json
{ "message": "Articles fetched and cached", "count": 12 }
```

### Step 5: Verify

1. Visit `https://your-domain.vercel.app/api/articles` - should return JSON with articles
2. Visit the Articles and Resources page - cards should render dynamically
3. Visit the homepage - "Insights & Leadership" section should show latest 3 articles

---

## Operations

### Daily Cron Job

The cron is configured in `vercel.json`:

```json
"crons": [{ "path": "/api/cron/fetch-articles", "schedule": "0 6 * * *" }]
```

This runs at 6:00 AM UTC daily. It:

1. Gets a valid LinkedIn access token (from Blob cache or env var, auto-refreshes if expired)
2. Fetches the latest articles from LinkedIn
3. Downloads article thumbnail images to Blob storage
4. Stores the article data as `articles.json` in Blob
5. If LinkedIn returns 0 articles, the existing cache is preserved

### Manually Triggering a Refresh

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/fetch-articles" \
  -H "Authorization: Bearer YOUR_CRON_SECRET_VALUE"
```

Or from the **Vercel dashboard**: **Settings** → **Cron Jobs** → click **Run** next to `fetch-articles`.

### Updating Fallback Articles

Fallback articles are used when the API is unavailable (before first fetch, Blob errors, etc.). To update them from the live deployment:

```bash
npm run update-fallback                    # Fetch from production
npm run update-fallback -- --dry           # Preview changes without writing
npm run update-fallback -- --url https://preview.example.com  # Custom URL
```

After running: review with `git diff assets/`, then build, test, and commit.

### Token Lifecycle

| Token         | Lifespan | Renewal                                                                                  |
| ------------- | -------- | ---------------------------------------------------------------------------------------- |
| Access Token  | 60 days  | Auto-refreshed by cron using refresh token; new token stored in Blob (`token-meta.json`) |
| Refresh Token | 365 days | **Manual** - must re-authenticate via LinkedIn OAuth when expired                        |

When the refresh token expires:

1. Go through the LinkedIn OAuth flow to get new tokens
2. Update `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_REFRESH_TOKEN` in Vercel env vars
3. Redeploy the project

### Monitoring

Check the **Vercel dashboard** → **Logs** for:

- `Stored X articles in Blob` - successful cron run
- `LinkedIn token was refreshed` - access token auto-renewed (normal)
- `Token refresh failed` - refresh token may be expired, manual action needed
- `LinkedIn returned 0 articles` - no articles found (cache preserved)

---

## Troubleshooting

### "Vercel Blob: No token found"

**Cause**: The Vercel Blob store has not been provisioned for this project.
**Fix**: Follow [Step 1](#step-1-create-the-vercel-blob-store) to create a Blob store. Then redeploy.

### Blog cards show fallback/old content

**Possible causes**:

1. Cron hasn't run yet → manually trigger it (see above)
2. LinkedIn API returned an error → check Vercel Logs
3. Environment variables not set → verify in Vercel Settings → Environment Variables
4. Deploy didn't pick up new env vars → redeploy the project

### `/api/articles` returns fallback data

**Cause**: Blob is empty (no cron run yet) or Blob read failed.
**Fix**: Trigger the cron manually, then check `/api/articles` again.

### Cron returns 401 Unauthorized

**Cause**: The `Authorization` header doesn't match `CRON_SECRET`.
**Fix**: Verify you're sending `Bearer YOUR_CRON_SECRET_VALUE` with the exact value from Vercel env vars. Note: Vercel's built-in cron scheduler sends this automatically - this error typically only happens with manual `curl` calls.

### LinkedIn API returns 401

**Cause**: Access token expired and refresh failed.
**Fix**:

1. Check Vercel Logs for `Token refresh failed` messages
2. If refresh token is expired (>365 days), re-authenticate via LinkedIn OAuth
3. Update `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_REFRESH_TOKEN` in Vercel env vars
4. Redeploy

### LinkedIn API returns 403

**Cause**: LinkedIn app doesn't have the required API permissions.
**Fix**: In LinkedIn Developer Portal, ensure your app has access to the **Pages Data Portability API** product (grants the `r_dma_admin_pages_content` scope). The authenticated user must have ADMINISTRATOR or CONTENT_ADMINISTRATOR role on the company page. Note: this product requires it to be the only product on the LinkedIn app - create a dedicated app if you have other products provisioned.

### No articles returned from LinkedIn

**Cause**: The DMA OriginalArticles API only returns LinkedIn Articles (long-form Pulse/Newsletter content). Regular posts, image shares, and video posts are not included.
**Fix**: This is expected behavior - the existing cache is preserved. Publish a new LinkedIn Article (not a regular post) to see it appear.

### Images not loading on blog cards

**Cause**: LinkedIn thumbnail download to Blob may have failed for specific images.
**Fix**: The system uses `onerror` fallback on `<img>` tags to show a local placeholder image. If persistent, trigger the cron again - image downloads are retried on each run.

---

## Architecture Reference

```
LinkedIn API  ──(daily cron)──>  Vercel Blob
                                   ├── articles.json      (article metadata)
                                   ├── images/*.jpg       (downloaded thumbnails)
                                   └── token-meta.json    (refreshed OAuth tokens)
                                        │
                                        ▼
                              /api/articles endpoint
                              (reads Blob, falls back to
                               fallback-articles.json)
                                        │
                                        ▼
                        Frontend JS renders blog cards
                   (fallback JSON renders immediately,
                    API data replaces when available)
```

### Key Files

| File                                     | Purpose                                                           |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `api/cron/fetch-articles.js`             | Cron function: fetch LinkedIn articles + images → store in Blob   |
| `api/articles.js`                        | API route: serve cached articles JSON to frontend                 |
| `api/lib/linkedin.js`                    | LinkedIn API client (fetch articles, token refresh)               |
| `api/lib/fallback-articles.js`           | Reads `assets/data/fallback-articles.json` for fallback responses |
| `assets/data/fallback-articles.json`     | Fallback article data (shared by frontend + backend)              |
| `assets/script/modules/blog-articles.js` | Frontend: fetches + renders blog cards dynamically                |
| `vercel.json`                            | Cron schedule configuration                                       |

### Vercel Free Tier Usage

| Resource             | Usage                                    | Limit           |
| -------------------- | ---------------------------------------- | --------------- |
| Cron Jobs            | 1 (daily)                                | 1 on Hobby plan |
| Blob Storage         | ~5-10 MB (JSON + images)                 | 250 MB          |
| Blob Puts            | ~1-2/day                                 | 1,000/month     |
| Function Invocations | ~30-50/day (cron + API with CDN caching) | 100,000/month   |
