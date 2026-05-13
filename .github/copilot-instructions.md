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
- **Clean URLs** - Vercel serves pages without `.html`. Use root-relative paths in links: `/unified-commerce`, not `/unified-commerce.html`.
- **Blog cards are JS-rendered** - `articles-and-resources.html` and `index.html` have empty `#blog-grid` / `#insights-grid` containers. Card HTML lives ONLY in `assets/script/modules/blog-articles.js`. Do NOT put card markup in HTML pages.
- **Fallback articles** - `assets/data/fallback-articles.json` is the single source shared by both frontend JS and backend API (`api/lib/fallback-articles.js`). Keep them in sync.
- **No inline scripts** - all JS goes through `assets/script/main.js` modules for CSP compatibility.
- **Mobile breakpoint is `lg:` (1024px)** - this controls desktop vs mobile layout throughout the site.
- **Swiper instances need unique names** - each slider gets a unique class (e.g., `.keyCapabilitySlider`). Reusing names breaks navigation.
- **OG images use absolute URLs** - `og:image` meta tags use `https://www.artisanscloud.com/assets/og/{page}.png`. Images are in `assets/og/` and copied to `dist/assets/og/` during build. When adding a new page, also add its entry to `scripts/generate-og-images.js` and run `npm run generate:og`.
- **Team card HTML is generated** - `team/*.html` files are produced by `scripts/generate-team-cards.js` from `assets/data/team-members.json`. Do NOT hand-edit them. To add a new team member: add photo + JSON entry, then run `npm run add:card` (generates HTML + OG image). Re-run after any JSON change.
- **Centering 5-card grids** - standard Tailwind `grid` doesn't easily center the last 2 cards in a 3-column layout. Use `flex flex-wrap justify-center` with calculated widths (`w-[calc(50%-10px)]` for 2-column on tablet, `w-[calc(33.333%-20px)]` for 3-column on desktop) combined with a matching `gap-` to center remaining items in the last row.
- **Image size limits enforced at commit** - a pre-commit hook (`.githooks/pre-commit`) flags staged images over per-type thresholds: PNG/JPG 300 KB, WebP 400 KB, SVG 50 KB. It only warns; nothing is modified. Run `npm run optimize:images -- <path>` to fix rasters via `sharp`. SVGs need manual cleanup (svgomg). Hook is wired up by `npm install` (the `prepare` script sets `core.hooksPath` to `.githooks`); if a clone predates this, run `npm install` again. Bypass with `git commit --no-verify` only when intentional.

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
