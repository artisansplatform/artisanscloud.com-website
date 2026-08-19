# Development Guide

## Local Development

```bash
npm run dev
# Starts Vite dev server at http://localhost:3000/ with auto-reload
# Runs in parallel:
#   - Vite dev server (watches HTML/JS files, auto-reloads browser)
#   - Tailwind CSS watch (compiles assets/style/input.css → assets/style/output.css)
# All changes trigger automatic browser reload - no manual refresh needed
```

## Adding a New Page

1. **Create HTML** in the repository root (e.g., `new-solution.html`) or inside a subdirectory (e.g., `enterprise-copilot/lumen.html`, `unified-commerce/nexus.html`). Page discovery is recursive and centralized in `scripts/lib/site-files.js`, so the build, the sitemap, the unit tests, and the e2e smoke tests all pick the page up automatically, even in a brand-new directory. Do not add per-directory globs anywhere; `tests/coverage-guard.test.js` fails the build if one appears.
2. **Use template structure** with Handlebars partials. The whole `<head>` comes from the `head-meta` partial:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       {{> head-meta}}
     </head>
     <body>
       <div id="cursor" class="hidden lg:block..."></div>
       {{> header}}

       <!-- Your page content here -->

       {{> footer}}

       <!-- Scripts: Swiper, GSAP, Lenis, main.js -->
     </body>
   </html>
   ```

3. **Add the metadata entry**: add an entry to `assets/data/pages.json` keyed by the file's path slug (e.g. `new-solution`, or the path without its `.html` extension for a page in a subdirectory such as `enterprise-copilot/lumen.html`) with at least `title` and `description` (see [Page metadata](#page-metadata-pagesjson) below). `tests/pages-meta.test.js` fails the build without it.
4. **Update navigation**: Edit `partials/header.html` to add link to new page (applies to ALL pages)
5. **Add OG image**: add `ogCard: { title, subtitle }` to the page's `pages.json` entry, run `npm run generate:og`, commit the PNG (see [Architecture: Open Graph Images](architecture.md#open-graph-images))
6. **Meet the on-page SEO checks** (enforced by `tests/seo.test.js`, see below): the head-meta partial takes care of all of them except "exactly one `<h1>`", which is up to your page content.
7. **Test**: Run `npm run dev` and verify at http://localhost:3000/new-solution
8. **Build**: Run `npm run build` to generate production files in `dist/`

## Page metadata (pages.json)

`assets/data/pages.json` is the single source of truth for per-page head metadata. Each root page has an entry keyed by slug (filename without `.html`):

```jsonc
"new-solution": {
  "title": "New Solution | Artisans Cloud",          // required, page <title> and og:title default
  "description": "One or two sentences.",            // required, meta + og:description default
  "keywords": "comma, separated",                    // optional
  "robots": "noindex",                               // optional (request-demo uses this)
  "og": false,                                       // optional: omit the whole OG/Twitter block
  "ogTitle": "...", "ogDescription": "...",          // optional overrides
  "ogImage": "/assets/og/custom.png",                // optional override (default /assets/og/{slug}.png)
  "ogCard": { "title": "New\nSolution", "subtitle": "..." },  // text baked into the generated og image
  "sitemap": { "priority": "0.8", "changefreq": "weekly" }    // optional; false excludes the page
}
```

The values flow through `scripts/lib/page-meta.js` into three consumers: the `head-meta` partial (via the Handlebars `context` in `vite.config.js`), `scripts/generate-sitemap.js`, and `scripts/generate-og-images.js`. Page-specific head extras (custom JSON-LD, inline styles) stay in the page itself, after `{{> head-meta}}`.

JSON-LD structured data is added automatically: the homepage gets Organization + WebSite, every other indexable page gets a BreadcrumbList, and team cards get Person schema. You only hand-write a JSON-LD `<script>` for richer per-page schema (Product, Article, extra FAQs). See [Architecture: Structured Data](architecture.md#structured-data-json-ld).

When renaming a page, rename the `pages.json` key, add a `vercel.json` redirect, and regenerate the OG image; `tests/pages-meta.test.js` flags orphan entries and orphan OG images if you forget.

## Fonts

Poppins is self-hosted; nothing is loaded from Google Fonts at runtime. Three pieces work together:

- **Font files**: `assets/fonts/poppins/poppins-{weight}[-italic]-{subset}.woff2`. Each variant ships as two unicode-range subsets, `latin` and `latin-ext`, so browsers only download what the page's characters need. Current variants: normal 400/500/600/700/800 and italic 400/600.
- **`@font-face` declarations**: in `assets/style/input.css`, one block per file, all with `font-display: swap`. They flow into `output.css` at build time; Vite then fingerprints the woff2 files and rewrites the urls.
- **Preloads**: `partials/head-meta.html` and the `scripts/generate-team-cards.js` template preload the two heaviest-used files (400 and 600 latin) to avoid a flash of fallback text. Vite rewrites these hrefs to the hashed filenames during build.

### Adding a new weight or style

1. Fetch Google's CSS for the variant with a browser user agent, for example:
   `curl -A "Mozilla/5.0 ... Chrome/126" "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300&display=swap"`
2. Download the `latin` and `latin-ext` woff2 urls from the response into `assets/fonts/poppins/` using the existing naming scheme.
3. Add matching `@font-face` blocks (with the `unicode-range` values from the response) to `assets/style/input.css`.
4. Run `npm run test:font` to confirm the subset and markup agree.

If markup uses a weight or style with no `@font-face`, the browser fakes it (synthesized bold/oblique) and `tests/font-subset.test.js` fails the build. The same test fails if a declared woff2 file is missing from the repo, if the partial and the team-card generator preload different files, or if any source references `fonts.googleapis.com` again.

Note: `npm run generate:og` still downloads Poppins TTFs at generation time because satori cannot read woff2. That is a build-tool dependency, not a runtime one.

## Adding a Digital Business Card

Team members have standalone digital card pages at `/team/{slug}` with vCard download, QR code, and sharing options.

### Automated workflow (recommended)

1. **Add profile photo** to `assets/image/team/[slug].[ext]` (400×400 recommended)
2. **Add entry** to `assets/data/team-members.json` with all member details (see schema below)
3. **Run** the combined command:
   ```bash
   npm run add:card
   ```
   This generates `team/[slug].html` **and** the 1200×630 OG image in one step.
4. **Test**: Visit `http://localhost:3000/team/[slug]` locally
5. **Commit**: `team/[slug].html`, `assets/og/team/[slug].png`, `assets/data/team-members.json`, and the photo

To regenerate a single card (e.g. after editing their JSON entry):

```bash
npm run generate:cards -- --slug dev-nair
npm run generate:og
```

### team-members.json schema

```json
{
  "slug": "first-last", // URL slug, also used for filenames
  "name": "First Last",
  "firstName": "First",
  "lastName": "Last",
  "title": "Job Title",
  "company": "Artisans Cloud",
  "companyUrl": "https://www.artisanscloud.com",
  "location": "City, Country", // optional
  "bio": "Short bio text.",
  "email": "first@artisanscloud.com",
  "phone": "", // optional, include country code
  "photo": "/assets/image/team/first-last.jpg",
  "social": {
    "linkedin": "https://www.linkedin.com/in/...", // optional
    "github": "https://github.com/...", // optional
    "twitter": "https://x.com/..." // optional - also sets twitter:creator
  },
  "photoCropTop": 0 // optional - pixel offset from top for OG image crop
}
```

> **Note**: `team/*.html` files are generated from JSON - don't hand-edit them. Re-run `npm run add:card` after any JSON change.

### Key files

| File                                    | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `assets/data/team-members.json`         | **Source of truth** for all team member data |
| `scripts/generate-team-cards.js`        | Generates `team/[slug].html` from JSON       |
| `scripts/generate-og-images.js`         | Generates OG images (includes team cards)    |
| `team/*.html`                           | Generated card pages - do not hand-edit      |
| `assets/script/modules/digital-card.js` | vCard generation, QR code, sharing logic     |
| `assets/image/team/`                    | Profile photos                               |

### Features

- **Save Contact**: Downloads `.vcf` vCard file with embedded photo
- **QR Code**: Rendered on-page via `qrcode` npm package (hidden on mobile)
- **Share**: Native Web Share API (falls back to clipboard copy)
- **Copy Link**: Copies card URL to clipboard
- **WhatsApp**: Opens WhatsApp share dialog
- **Email**: Opens mailto with pre-filled subject/body

## Adding a Swiper Slider

1. **HTML structure**: Use `.swiper`, `.swiper-wrapper`, `.swiper-slide`, navigation buttons
2. **JavaScript**: Add config in `assets/script/main.js` (inside DOMContentLoaded)
   - Unique class selector (e.g., `.newSliderName`)
   - Breakpoint config for responsive columns
   - Navigation selectors: `.swiper-button-next-newSliderName`, `.swiper-button-prev-newSliderName`
3. **CSS**: Swiper CSS already imported globally

## Updating Header or Footer

- **Edit once, applies everywhere**:
  - Header: Edit `partials/header.html` only
  - Footer: Edit `partials/footer.html` only
  - Changes automatically apply to ALL pages during build
- **No need to update individual HTML files**: the `{{> header}}` and `{{> footer}}` placeholders pull in the latest content
- **Keep desktop and mobile nav in sync**: when adding or moving a header link, update both the desktop nav row and the mobile menu in `partials/header.html`
- **Test changes**: Run `npm run dev` to see updates across all pages immediately

## Updating Blog Articles

- **To change card design**: Edit the `createBlogCardHTML()` / `createInsightsCardHTML()` functions in `blog-articles.js`
- **To update fallback articles from live data**: Run `npm run update-fallback` (fetches latest from deployed API, downloads images locally)
- **To update fallback articles manually**: Edit `assets/data/fallback-articles.json` (one file, used by both frontend and backend). Fallback articles use a `tags` array (e.g. `["AI", "Retail"]`).
- **To add articles**: New LinkedIn articles are fetched automatically by the daily cron - no manual updates needed
- **Tag extraction logic**: Tags are auto-assigned by checking both the article **title** and **content** (stripped of HTML).
  - There are currently three tags:
    - **AI**: Matches keywords like `ai`, `artificial intelligence`, `machine learning`, `llm`, etc.
    - **Data**: Matches keywords like `data analytics`, `data pipeline`, `business intelligence`, etc.
    - **Retail**: Matches keywords like `retail`, `store`, `omnichannel`, `pos`, etc.
  - The extractor (`extractTags` in `api/lib/linkedin.js`) assigns up to 3 tags. If no matches are found, it defaults to `['Retail']`.

### Articles and Resources Pagination (Load More)

The Articles and Resources page shows articles in pages of 9. The "Load More" button (`#load-more-btn`) is controlled entirely by JS - it starts hidden and appears only when there are more than 9 articles to show. Clicking it reveals the next 9, until all are shown.

- **Batch size**: `ARTICLES_PER_PAGE = 9` constant in `blog-articles.js`
- **Fallback data** (9 articles) → button stays hidden - all fit on the first page
- **Live API data** (>9 articles) → button appears after the API response renders
- **Insights grid** (homepage) is unaffected - always shows the latest 3

### Update Fallback Script

```bash
npm run update-fallback                    # Fetch from production and update files
npm run update-fallback -- --dry           # Preview changes without writing files
npm run update-fallback -- --url https://preview.example.com  # Fetch from custom URL
```

- Fetches articles from the deployed `/api/articles` endpoint
- Downloads thumbnail images locally to `public/assets/image/blog/` (served as `/assets/image/blog/...` via Vite's public directory)
- Updates `assets/data/fallback-articles.json` with the latest 9 articles
- After running: review with `git diff assets/ public/`, then build, test, and commit

## Sitemap

`dist/sitemap.xml` is generated automatically as part of every `npm run build` - no manual editing required.

### How it works

- `scripts/generate-sitemap.js` runs as `build:sitemap` (after Vite's `build:html`)
- It discovers both root `*.html` pages and nested subdirectory pages (e.g., `enterprise-copilot/*.html`, `unified-commerce/*.html`, `role-play-agent/*.html`, `knowledge-harvester/*.html`) so they are included automatically
- Excluded pages (`"sitemap": false` in `pages.json`): `404.html`, `blog-detail.html`, `request-demo.html`, `thank-you.html`, `retail-platform.html`
- Entries are written in each page's editorial `sitemap.order` (see below), matching `task.md`'s reference sequence exactly. `<url>` order carries no crawl weight on its own; this is purely for human readability
- `public/robots.txt` is a static file (Vite passthrough); it references the sitemap URL and is deployed to `dist/robots.txt` unchanged

### Customising per-page SEO hints

Every indexable page carries an explicit `sitemap` block on its entry in `assets/data/pages.json`:

```jsonc
"my-new-page": { ..., "sitemap": { "priority": "0.8", "changefreq": "weekly", "order": 12 } }
```

`priority`/`changefreq` are set editorially, judged relative to the other pages in the sitemap. `order` is the page's 1-based position in `dist/sitemap.xml` - also editorial, and independent of `priority`: two pages sharing a priority tier can still be ordered deliberately (`generate-sitemap.js` sorts by `order` ascending; a page with no `order` sorts last). `DEFAULT_META` (`{ priority: '0.6', changefreq: 'monthly' }`, no `order`) in `scripts/generate-sitemap.js` is a fallback for pages that haven't been given their own entry yet; it is not meant to be relied on long-term. `tests/sitemap-meta.test.js` fails if an indexable page is missing its `sitemap` block, or if `dist/sitemap.xml` disagrees with `pages.json` on priority, changefreq, or ordering.

### Adding a new page

Create the `*.html` file in the root - it will appear in the next build's sitemap automatically using `DEFAULT_META` (sorted last) until you set its own `sitemap` field, including `order`, in `pages.json` (required by `tests/sitemap-meta.test.js`).

### Excluding a page

Set `"sitemap": false` on the page's entry in `assets/data/pages.json`.

### Submitting to Google

After first deploying the sitemap, submit `https://www.artisanscloud.com/sitemap.xml` once in Google Search Console. Subsequent deploys are picked up automatically via recrawl.

## On-page SEO checks

`tests/seo.test.js` runs as part of `npm test` (and therefore CI) and auto-discovers every built page in `dist/` (root pages plus generated `team/*.html`). For each page it asserts:

- `<html lang>` is present (document language).
- Exactly one `<h1>` (redirect stubs that use `<meta http-equiv="refresh">` are skipped).
- `og:url` and the canonical link resolve to the same host, so the www / non-www signal never conflicts.
- Any page with Open Graph tags also has `<meta name="twitter:card" content="summary_large_image">` and a non-empty `<meta name="description">`.
- Every `<img>` has an `alt` attribute, and each page emits valid JSON-LD with the expected type.

Run just these checks with `npm run test:seo`. If you add a page that legitimately should not satisfy one of these (for example a new redirect stub), make it a `<meta http-equiv="refresh">` page or extend the exclusion logic in the test rather than weakening the assertion.

## Automated guardrails

`npm test` runs every check below in CI (`.github/workflows/test.yml`). Each guards a documented footgun so a mistake fails the PR instead of shipping:

| Check            | File                            | What it catches                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build / partials | `tests/build.test.js`           | pages build, partials resolved, blog containers/CSS/JS/sitemap/robots present                                                                                                                                                                                                            |
| Internal links   | `tests/links.test.js`           | links and local assets that 404                                                                                                                                                                                                                                                          |
| On-page SEO      | `tests/seo.test.js`             | missing lang / h1 / description / twitter card, og-canonical host mismatch, missing img alt, invalid JSON-LD                                                                                                                                                                             |
| Page metadata    | `tests/pages-meta.test.js`      | hand-written heads, missing/orphan `pages.json` entries, missing/orphan/wrong-size OG images, noindex page left in sitemap                                                                                                                                                               |
| Conventions      | `tests/conventions.test.js`     | inline executable scripts, duplicate Swiper selectors, broken/ shadowing redirects, redirect stubs left in the sitemap, em dashes (literal, HTML entity, or spaced en dash) in tracked and untracked files, shell-string child processes (tracked and untracked), POSIX-only npm scripts |
| Font subset      | `tests/font-subset.test.js`     | a font weight/style used in markup with no `@font-face`, a missing woff2 file, or a stray Google Fonts reference                                                                                                                                                                         |
| Security headers | `tests/vercel-security.test.js` | missing security headers / cron config in `vercel.json`                                                                                                                                                                                                                                  |
| Coverage guard   | `tests/coverage-guard.test.js`  | drift between page discovery and git, sitemap gaps/ghosts, hardcoded page globs outside `site-files.js`, a resurrected (dead) `tailwind.config.js`, full pages saved into `partials/`, growth of the discovery exclusion list                                                            |
| Docs             | `tests/docs.test.js`            | broken markdown tables (tracked and untracked files): a row split from its table by a blank line, or a table with no header separator row; backticked file paths that do not exist                                                                                                       |
| Formatting       | `tests/format.test.js`          | files prettier would rewrite, and grandfathered entries that have become clean                                                                                                                                                                                                           |
| Platform paths   | `tests/platform.test.js`        | missing `.gitattributes` LF rule, and a `glob.sync` call under `tests/` that returns native path separators without going through `toPosix()` in `tests/lib/paths.js`                                                                                                                    |

Per-area run scripts: `test:seo`, `test:meta`, `test:conventions`, `test:font`, `test:links`, `test:build`, `test:guard`, `test:docs`, `test:format`.

`tests/docs.test.js` also checks that every directory-qualified path written in single-backtick inline code inside a markdown file (tracked or untracked) points at something real. It strips fenced code blocks first, then for each single-line inline code span containing a `/`, it rejects shell commands (whitespace), URLs/protocols, site routes (leading `/`), globs/placeholders (`*`, `{`, `[`, `<`, `...`, or an all-caps path segment), MIME types, and `@scope` package names. A surviving candidate resolves if it exists on disk, is a suffix of a git-tracked path (so docs can write `modules/card-toggle.js` for `assets/script/modules/card-toggle.js`), or is gitignored (`git check-ignore`). If a doc needs to reference a real, planned-but-not-yet-created deliverable, add it to `PLANNED_FILES` in `tests/docs.test.js` with a short note on where it's promised; a second test fails if that entry ever lands on disk (drop the exemption) or stops being referenced by any doc (delete the entry), so the escape hatch can't go stale silently.

The coverage guard exists because checks themselves can rot: PR #111 showed that hardcoded directory lists in configs and tests go stale silently when pages move into new directories. Discovery now lives in one file (`scripts/lib/site-files.js`) and the guard cross-checks it against independent ground truth (git, the built sitemap) in both directions. When you add a check that iterates pages, import `allPages()` / `contentPages()` / `partialFiles()` from `site-files.js` instead of writing a glob.

Code style is pinned by `.prettierrc.json` / `.prettierignore`. Run `npm run prettier` before committing; `tests/format.test.js` checks the whole repo. The only exceptions are three legacy pages listed in `GRANDFATHERED` in that test file (`POS.html`, `browser-pos.html`, `data-intelligence.html`); formatting one means deleting its entry (the test enforces that) after a visual check at 393px / 768px / 1280px.

Never start a child process from a command string (`exec(cmd)`, `execSync(cmd)`, or any call passing `shell: true`). A command string is re-parsed by a shell, and on Windows that shell is `cmd.exe` with different quoting rules than POSIX, so a path with a space, glob character, or quote can break or, worse, be reinterpreted. Use the array form instead: `execFileSync(cmd, [args], { cwd, encoding })`.

`spawn`, `spawnSync`, `fork`, and `execFile*` are deliberately not banned. Called with an args array they never involve a shell, so they are already the fix rather than the problem, and `spawn` is the only reasonable choice for a streaming or long-running child, since `execFileSync` is synchronous and buffers all output.

`tests/conventions.test.js` enforces this across `scripts/`, `tests/`, `api/`, and the root config files, covering untracked files as well as tracked ones so a freshly written script is caught before it is staged.

The repo has a `.gitattributes` at the root forcing `* text=auto eol=lf`, so every text file checks out with LF regardless of platform or local git config (Git for Windows defaults to `core.autocrlf=true`, which would otherwise materialize CRLF files and fail `tests/format.test.js` since `.prettierrc` pins `endOfLine` to `lf`). Do not override this per-file, and do not let an editor auto-convert line endings on save.

`glob.sync(...)` returns native path separators, so a call under `tests/` returns backslash-joined paths on Windows while git (`ls-files`, `grep`) always emits forward slashes. Any test comparing or joining glob output against a POSIX-style path must route it through `toPosix()` from `tests/lib/paths.js` (`.map(toPosix)` on the glob result). `tests/platform.test.js` scans every `tests/*.js` file and fails the build if a new `glob.sync` call site skips this. Production code outside `tests/` (e.g. `scripts/lib/site-files.js`) cannot import from `tests/`, so it inlines the same backslash-to-forward-slash normalization instead.

`package.json` scripts must run on Windows `cmd.exe` as well as POSIX shells (CI runs a `windows-latest` job). Do not use unix-only binaries (`cp`, `rm`, `mv`, `mkdir -p`, `cat`, `sed`, `grep`), POSIX stderr redirects to the null device, pipes, backticks, command substitution, or shell env-var expansion in a script value. For a one-off file operation, use `node -e "..."` with double quotes on the outside and single quotes inside (`cmd.exe` does not strip single quotes, so the reverse breaks there) - see `build:static`. For anything needing real error handling, write a small file under `scripts/` instead, like `scripts/setup-hooks.js` backing `prepare`. `tests/conventions.test.js` (`describe("Cross-platform npm scripts")`) enforces this; a script that genuinely cannot be made cross-platform can be added to `CROSS_PLATFORM_EXEMPT` in that file with a one-line reason, and a staleness test fails if that entry stops applying.

## Image Optimization

The repo ships oversized banners and SVGs occasionally, so a pre-commit hook checks staged images and refuses the commit if any exceed per-type size limits. The hook only warns: it does not rewrite files.

### Size thresholds

| Type           | Limit  |
| -------------- | ------ |
| PNG, JPG, JPEG | 300 KB |
| WebP           | 400 KB |
| SVG            | 50 KB  |

These are conservative defaults intended for marketing imagery. Tune them in `scripts/check-images.js` if a legitimate asset needs more headroom.

### How it works

- `.githooks/pre-commit` collects staged image paths and pipes them to `node scripts/check-images.js --staged`.
- The check reads the size of the _staged blob_ via `git cat-file -s :path`, not the working tree, so it always reflects what is actually about to be committed. After running `optimize:images`, you must `git add` the file again for the new version to be picked up.
- IDE "commit all" flows (VSCode Stage All, JetBrains default commit) auto-stage modified tracked files before invoking commit, so the hook covers those too. Truly untracked files are ignored, but they aren't being committed either.
- `npm install` runs the `prepare` script, which sets `core.hooksPath` to `.githooks`. New clones get the hook automatically; existing clones need to run `npm install` once after pulling.
- A failed check prints the offending paths, the size, and an exact `npm run optimize:images` command to fix the raster files.

### Commands

```bash
npm run check:images                          # Scan every asset under assets/ (no args)
npm run check:images -- path/to/img.webp      # Scan specific files
npm run optimize:images -- path/to/img.webp   # Re-encode in place via sharp
```

The optimizer writes a `.tmp` sibling, compares sizes, and only replaces the original if smaller. PNGs use palette + compression level 9, JPGs use mozjpeg at q=82, WebPs use q=80 + effort 6. SVGs are skipped; clean them up by hand (svgomg) or strip embedded raster data.

### Bypass

For exceptional cases (e.g., a banner that genuinely needs to be large), commit with `git commit --no-verify`. Do not normalize the bypass into a habit.

## Typography Scale

All headings and body copy use a set of semantic classes defined once in `assets/style/input.css`. Use these instead of hand-writing font sizes or line-heights.

| Class        | Role                   | Output                                                                       |
| ------------ | ---------------------- | ---------------------------------------------------------------------------- |
| `.t-display` | Hero / page `<h1>`     | `font-semibold leading-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl` |
| `.t-h2`      | Section title `<h2>`   | `font-semibold leading-heading text-3xl md:text-4xl lg:text-5xl`             |
| `.t-h2-sm`   | Compact section title  | `font-semibold leading-heading text-2xl lg:text-3xl`                         |
| `.t-h3`      | Card / sub-heading     | `font-semibold leading-heading text-xl lg:text-2xl`                          |
| `.t-lead`    | Lead / intro paragraph | `font-normal leading-body text-lg lg:text-xl`                                |
| `.t-body`    | Default paragraph      | `font-normal leading-body text-base`                                         |
| `.t-body-sm` | Small / secondary text | `font-normal leading-body text-sm`                                           |
| `.t-caption` | Captions / labels      | `font-normal leading-body text-xs`                                           |

Usage pattern: the `.t-*` class owns only size, weight, and line-height. Add color and spacing as separate utilities:

```html
<h2 class="mb-5 text-heading t-h2">Section Title</h2>
<h2 class="mb-5 text-white t-h2">Dark Section Title</h2>
```

Rules:

- Never hand-write `text-[NNpx]` or `leading-[NN%]` in markup.
- Never add `font-primary` to elements; `body` already sets Poppins globally.
- To change the type scale globally, edit the class definitions in `assets/style/input.css`, not individual pages.

## Common UI Conventions

| Convention          | Pattern                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Button styling**  | `.py-3 .px-5 .rounded-[40px] .bg-heading .text-white` (primary CTA)                     |
| **Spacing utility** | `gap-` prefix for flexbox gaps; margin/padding as `m-`/`p-`                             |
| **Breakpoints**     | `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)                            |
| **Animation**       | `.transition-all .duration-300 .ease-in-out` (standard); `.translate-x-full` for slides |
| **Menu items**      | `.dropdown-item` class on links inside `.dropdown-menu`                                 |
| **Swiper config**   | `slidesPerView: 1` (mobile), scaling up at breakpoints                                  |
