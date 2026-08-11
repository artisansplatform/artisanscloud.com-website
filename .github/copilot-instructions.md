# Artisans Cloud Website

Static marketing website. Vanilla HTML/JS + Tailwind CSS v4 + Handlebars (build-time) on Vercel.

## Global Writing Rules

**Never use em dashes anywhere in the codebase.** This includes:

- Code comments
- Docstrings
- Markdown files
- HTML content
- JavaScript or any other language strings

Always replace em dashes with appropriate punctuation such as commas, periods, colons, or parentheses.

**Additional writing guidelines:**

- Prefer simple, human-readable language over AI-style phrasing
- Avoid overly structured or repetitive sentence patterns
- Keep explanations concise and practical
- Write as an experienced developer, not as a generic assistant

## Commands
```bash
npm run dev              # Dev server at http://localhost:3000/ (Vite + Tailwind watch)
npm run build            # Production build (CSS + HTML to dist/)
npm test                 # Unit tests (build + link validation)
npm run test:e2e         # Playwright E2E tests (headless)
npm run update-fallback  # Update fallback blog articles from live deployment
npm run generate:og      # Regenerate OG images (requires network for font download)
npm run generate:cards   # Regenerate all team card HTML pages from team-members.json
npm run add:card         # Add/update a team card: generates HTML + OG image (run after editing JSON)
npm run check:images     # Flag staged or all assets/ images that exceed size thresholds
npm run optimize:images  # Re-encode raster images in place via sharp (pass paths after --)
```

## Gotchas & Landmines

- **Header/Footer are Handlebars partials** - edit `partials/header.html` or `partials/footer.html` ONLY. Never duplicate header/footer HTML into individual pages. `{{> header}}` and `{{> footer}}` are replaced at build time.
- **Clean URLs** - Vercel serves pages without `.html`. Use root-relative paths in links: `/unified-commerce/nexus`, not `/unified-commerce/nexus.html`.
- **Page discovery is centralized** - `scripts/lib/site-files.js` is the only file allowed to know where pages live (recursive glob, short exclusion list). The Vite build, sitemap, unit tests, and the e2e page list all import `allPages()` / `contentPages()` / `partialFiles()` from it, so a page in a brand-new directory is covered everywhere automatically. Never hardcode a page glob like `glob.sync("some-dir/*.html")` in a config, script, or test; `tests/coverage-guard.test.js` fails the build if one appears, and also cross-checks discovery against git and the built sitemap in both directions.
- **No tailwind.config.js, on purpose** - Tailwind v4 auto-detects source files and only loads a JS config through an explicit `@config` directive in the CSS, which this project does not use. A recreated config file is silently ignored (content globs do nothing, theme edits never apply). Theme values go in the `@theme` block of `assets/style/input.css`. Enforced by `tests/coverage-guard.test.js`.
- **Blog cards are JS-rendered** - `articles-and-resources.html` and `index.html` have empty `#blog-grid` / `#insights-grid` containers. Card HTML lives ONLY in `assets/script/modules/blog-articles.js`. Do NOT put card markup in HTML pages.
- **Fallback articles** - `assets/data/fallback-articles.json` is the single source shared by both frontend JS and backend API (`api/lib/fallback-articles.js`). Keep them in sync.
- **No inline scripts** - all JS goes through `assets/script/main.js` modules for CSP compatibility. Put page behavior in an `assets/script/modules/*.js` file that no-ops when its target element is absent (see `modules/card-toggle.js`) and import it in `main.js`. Enforced by `tests/conventions.test.js` (data blocks `application/ld+json` / `application/json` and redirect stubs are exempt).
- **Mobile breakpoint is `lg:` (1024px)** - this controls desktop vs mobile layout throughout the site.
- **Swiper instances need unique names** - each slider gets a unique class (e.g., `.keyCapabilitySlider`). Reusing names breaks navigation. The slider selectors and their next/prev nav classes in `assets/script/modules/swiper-sliders.js` are checked for uniqueness by `tests/conventions.test.js`.
- **OG images use absolute URLs** - `og:image` meta tags use `https://www.artisanscloud.com/assets/og/{page}.png`. Images are in `assets/og/` and copied to `dist/assets/og/` during build. When adding a new page, add `ogCard` text to its `pages.json` entry, run `npm run generate:og`, and commit the PNG; `tests/pages-meta.test.js` fails if the image is missing or not exactly 1200x630.
- **Team card HTML is generated** - `team/*.html` files are produced by `scripts/generate-team-cards.js` from `assets/data/team-members.json`. Do NOT hand-edit them. To add a new team member: add photo + JSON entry, then run `npm run add:card` (generates HTML + OG image). Re-run after any JSON change.
- **Centering 5-card grids** - standard Tailwind `grid` doesn't easily center the last 2 cards in a 3-column layout. Use `flex flex-wrap justify-center` with calculated widths (`w-[calc(50%-10px)]` for 2-column on tablet, `w-[calc(33.333%-20px)]` for 3-column on desktop) combined with a matching `gap-` to center remaining items in the last row.
- **Typography is centralized** - Use `.t-display` / `.t-h2` / `.t-h2-sm` / `.t-h3` / `.t-lead` / `.t-body` / `.t-body-sm` / `.t-caption` for all headings and body copy (defined in `assets/style/input.css`). Do not hand-code font sizes (`text-[NNpx]`) or line-heights (`leading-[NN%]`), and do not add `font-primary` to any element (`body` already sets Poppins globally). See `docs/development.md` (Typography Scale).
- **Image size limits enforced at commit** - a pre-commit hook (`.githooks/pre-commit`) flags staged images over per-type thresholds: PNG/JPG 300 KB, WebP 400 KB, SVG 50 KB. It only warns; nothing is modified. Run `npm run optimize:images -- <path>` to fix rasters via `sharp`. SVGs need manual cleanup (svgomg). Hook is wired up by `npm install` (the `prepare` script sets `core.hooksPath` to `.githooks`); if a clone predates this, run `npm install` again. Bypass with `git commit --no-verify` only when intentional.
- **On-page SEO is test-enforced** - `tests/seo.test.js` (part of `npm test` / CI) checks every built page for `<html lang>`, exactly one `<h1>`, a non-empty meta description, an `og:url` whose host matches the canonical link (always use the `www.` host), and `<meta name="twitter:card" content="summary_large_image">` in the OG block. New pages must satisfy these. See `docs/development.md` (On-page SEO checks).
- **Page heads are generated from pages.json** - every root page's `<head>` is just `{{> head-meta}}`; title, description, canonical, and OG/Twitter tags come from `assets/data/pages.json` via the partial. Do NOT hand-write `<title>`/`<meta>`/`<link>` tags in a page head (page-specific JSON-LD `<script>` or `<style>` after the partial is fine). Edit `partials/head-meta.html` to change head conventions, `pages.json` to change a page's metadata. `team/*.html` heads come from the `scripts/generate-team-cards.js` template instead. Enforced by `tests/pages-meta.test.js`.
- **JSON-LD structured data is auto-generated** - `buildJsonLd()` in `scripts/lib/page-meta.js` emits Organization + WebSite on the homepage and a BreadcrumbList on every other indexable page; team cards get Person schema from the generator. Site-wide identity (name, logo, social `sameAs`, support email) lives in the `ORGANIZATION`/`WEBSITE` constants there. For richer per-page schema (Product, Article, extra FAQs) add an inline `<script type="application/ld+json">` after `{{> head-meta}}` in the page. Enforced by `tests/seo.test.js`.
- **Fonts are self-hosted** - Poppins woff2 subsets live in `assets/fonts/poppins/` with `@font-face` blocks in `assets/style/input.css`; nothing loads from Google Fonts at runtime. To use a new weight or style, download its latin + latin-ext woff2 files and add matching `@font-face` blocks first (see `docs/development.md`, Fonts), otherwise the browser synthesizes it. `tests/font-subset.test.js` fails if markup uses an undeclared variant, a declared font file is missing, or anything references `fonts.googleapis.com` again.
- **URL Redirects on File Rename** - Every time an AI or user renames a file (changing an existing URL), a corresponding redirect rule from the old URL to the new URL MUST be added to the `redirects` list in `vercel.json`. `tests/conventions.test.js` checks that every redirect destination resolves, that a redirect never shadows a live content page, and that meta-refresh redirect stubs are marked `"sitemap": false` in `pages.json`.
- **Content Security Policy** - `vercel.json` defines an enforced CSP (`Content-Security-Policy`; see `docs/architecture.md`). If you add a third-party script, style host, image host, or network call, add its origin to the matching `script-src`/`connect-src`/etc. directive, otherwise it is reported (and, once enforcement is on, blocked). Never add `'unsafe-inline'` to `script-src`; put JS in a module instead. `tests/vercel-security.test.js` guards the core directives.

## Documentation Rule
**After every code change, update the relevant docs.** This is mandatory, not optional.

| What changed | What to update |
|---|---|
| New page added | `docs/development.md` (Adding a New Page), `docs/architecture.md` (Key files) |
| New build script or `package.json` script | `docs/architecture.md` (Deployment / Build process), `docs/development.md` (Commands) |
| New `scripts/` file | `docs/development.md` (describe purpose and usage) |
| New API route or cron | `docs/architecture.md` (Dynamic Blog Articles or Deployment) |
| New gotcha or footgun discovered | `AGENTS.md` and `CLAUDE.md` (Gotchas & Landmines) - keep both files in sync |
| SEO / sitemap changes | `docs/development.md` (Sitemap section) |
| Architecture change | `docs/architecture.md` |

If a doc section doesn't exist yet, add it. Never leave a feature undocumented.

## PR Checklist
- Pages use `{{> header}}` and `{{> footer}}` partials
- `npm run build` succeeds
- `npm test` passes
- No console errors on affected pages
- Responsive at 393px, 768px, 1280px
- New features have E2E tests in `tests/e2e/`
- Relevant docs updated (see Documentation Rule above)

## Detailed Docs
- [`docs/architecture.md`](docs/architecture.md) - page structure, styling, JS patterns, component reuse, routing
- [`docs/development.md`](docs/development.md) - adding pages, sliders, updating header/footer, blog articles, UI conventions
- [`docs/coding-standards.md`](docs/coding-standards.md) - code quality, performance, accessibility, security
- [`docs/dynamic-blog-setup.md`](docs/dynamic-blog-setup.md) - LinkedIn blog system setup, operations, env vars, token management
- [`docs/troubleshooting.md`](docs/troubleshooting.md) - debugging UI, build, and blog system issues
