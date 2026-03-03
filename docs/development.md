# Development Guide

## Local Development
```bash
npm run dev
# Starts Vite dev server at http://localhost:3000/ with auto-reload
# Runs in parallel:
#   - Vite dev server (watches HTML/JS files, auto-reloads browser)
#   - Tailwind CSS watch (compiles assets/style/input.css → assets/style/output.css)
# All changes trigger automatic browser reload — no manual refresh needed
```

## Adding a New Page
1. **Create HTML** (e.g., `new-solution.html`) in repository root
2. **Use template structure** with Handlebars partials:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <!-- Meta tags, title, stylesheets -->
       <link rel="stylesheet" href="./assets/style/output.css">
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
3. **Update navigation**: Edit `partials/header.html` to add link to new page (applies to ALL pages)
4. **Mark active state**: In new page's `<head>` or inline script, add logic to highlight active nav link
5. **Test**: Run `npm run dev` and verify at http://localhost:3000/new-solution
6. **Build**: Run `npm run build` to generate production files in `dist/`

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
- **No need to update individual HTML files** — the `{{> header}}` and `{{> footer}}` placeholders pull in the latest content
- **Test changes**: Run `npm run dev` to see updates across all pages immediately

## Updating Blog Articles
- **To change card design**: Edit the `createBlogCardHTML()` / `createInsightsCardHTML()` functions in `blog-articles.js`
- **To update fallback articles from live data**: Run `npm run update-fallback` (fetches latest from deployed API, downloads images locally)
- **To update fallback articles manually**: Edit `assets/data/fallback-articles.json` (one file, used by both frontend and backend)
- **To add articles**: New LinkedIn articles are fetched automatically by the daily cron — no manual updates needed

### Blog List Pagination (Load More)
The blog list page shows articles in pages of 9. The "Load More" button (`#load-more-btn`) is controlled entirely by JS — it starts hidden and appears only when there are more than 9 articles to show. Clicking it reveals the next 9, until all are shown.

- **Batch size**: `ARTICLES_PER_PAGE = 9` constant in `blog-articles.js`
- **Fallback data** (9 articles) → button stays hidden — all fit on the first page
- **Live API data** (>9 articles) → button appears after the API response renders
- **Insights grid** (homepage) is unaffected — always shows the latest 3

### Update Fallback Script
```bash
npm run update-fallback                    # Fetch from production and update files
npm run update-fallback -- --dry           # Preview changes without writing files
npm run update-fallback -- --url https://preview.example.com  # Fetch from custom URL
```
- Fetches articles from the deployed `/api/articles` endpoint
- Downloads thumbnail images locally to `assets/image/blog/`
- Updates `assets/data/fallback-articles.json` with the latest 9 articles
- After running: review with `git diff assets/`, then build, test, and commit

## Sitemap

`dist/sitemap.xml` is generated automatically as part of every `npm run build` — no manual editing required.

### How it works
- `scripts/generate-sitemap.js` runs as `build:sitemap` (after Vite's `build:html`)
- It uses `glob.sync('*.html')` — the same discovery pattern as `vite.config.js` — so every page in the root is included automatically
- Excluded pages: `404.html`, `thank-you.html`, `blog-detail.html`
- `public/robots.txt` is a static file (Vite passthrough); it references the sitemap URL and is deployed to `dist/robots.txt` unchanged

### Customising per-page SEO hints
Edit `PAGE_META` in `scripts/generate-sitemap.js` to override `priority` and `changefreq` for a specific page:

```js
'my-new-page.html': { priority: '0.8', changefreq: 'weekly' },
```

Pages not listed in `PAGE_META` get `{ priority: '0.6', changefreq: 'monthly' }`.

### Adding a new page
No sitemap action required. Just create the `*.html` file in the root — it will appear in the next build's sitemap automatically. To fine-tune its SEO weight, add it to `PAGE_META`.

### Excluding a page
Add its filename to the `EXCLUDED_PAGES` set at the top of `scripts/generate-sitemap.js`.

### Submitting to Google
After first deploying the sitemap, submit `https://www.artisanscloud.com/sitemap.xml` once in Google Search Console. Subsequent deploys are picked up automatically via recrawl.

## Common UI Conventions

| Convention | Pattern |
|-----------|---------|
| **Button styling** | `.py-3 .px-5 .rounded-[40px] .bg-heading .text-white` (primary CTA) |
| **Spacing utility** | `gap-` prefix for flexbox gaps; margin/padding as `m-`/`p-` |
| **Breakpoints** | `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px) |
| **Animation** | `.transition-all .duration-300 .ease-in-out` (standard); `.translate-x-full` for slides |
| **Menu items** | `.dropdown-item` class on links inside `.dropdown-menu` |
| **Swiper config** | `slidesPerView: 1` (mobile), scaling up at breakpoints |
