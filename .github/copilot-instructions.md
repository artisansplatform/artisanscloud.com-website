# Artisans Cloud Website

Static marketing website. Vanilla HTML/JS + Tailwind CSS v4 + Handlebars (build-time) on Vercel.

## Commands
```bash
npm run dev              # Dev server at http://localhost:3000/ (Vite + Tailwind watch)
npm run build            # Production build (CSS + HTML to dist/)
npm test                 # Unit tests (build + link validation)
npm run test:e2e         # Playwright E2E tests (headless)
npm run update-fallback  # Update fallback blog articles from live deployment
```

## Gotchas & Landmines

- **Header/Footer are Handlebars partials** — edit `partials/header.html` or `partials/footer.html` ONLY. Never duplicate header/footer HTML into individual pages. `{{> header}}` and `{{> footer}}` are replaced at build time.
- **Clean URLs** — Vercel serves pages without `.html`. Use root-relative paths in links: `/retail-platform`, not `/retail-platform.html`.
- **Blog cards are JS-rendered** — `blog-list.html` and `index.html` have empty `#blog-grid` / `#insights-grid` containers. Card HTML lives ONLY in `assets/script/modules/blog-articles.js`. Do NOT put card markup in HTML pages.
- **Fallback articles** — `assets/data/fallback-articles.json` is the single source shared by both frontend JS and backend API (`api/lib/fallback-articles.js`). Keep them in sync.
- **No inline scripts** — all JS goes through `assets/script/main.js` modules for CSP compatibility.
- **Mobile breakpoint is `lg:` (1024px)** — this controls desktop vs mobile layout throughout the site.
- **Swiper instances need unique names** — each slider gets a unique class (e.g., `.keyCapabilitySlider`). Reusing names breaks navigation.

## PR Checklist
- Pages use `{{> header}}` and `{{> footer}}` partials
- `npm run build` succeeds
- `npm test` passes
- No console errors on affected pages
- Responsive at 393px, 768px, 1280px
- New features have E2E tests in `tests/e2e/`

## Detailed Docs
- [`docs/architecture.md`](docs/architecture.md) — page structure, styling, JS patterns, component reuse, routing
- [`docs/development.md`](docs/development.md) — adding pages, sliders, updating header/footer, blog articles, UI conventions
- [`docs/coding-standards.md`](docs/coding-standards.md) — code quality, performance, accessibility, security
- [`docs/dynamic-blog-setup.md`](docs/dynamic-blog-setup.md) — LinkedIn blog system setup, operations, env vars, token management
- [`docs/troubleshooting.md`](docs/troubleshooting.md) — debugging UI, build, and blog system issues
