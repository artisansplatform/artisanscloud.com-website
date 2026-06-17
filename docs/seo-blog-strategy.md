# Blog SEO Strategy

## Context

Today the website publishes no blog content of its own. Articles are written on LinkedIn Pulse and the site links out to them. `articles-and-resources.html` and the homepage `#insights-grid` render cards from `assets/data/fallback-articles.json`, then refresh from `/api/articles` (backed by a daily LinkedIn cron in `api/cron/fetch-articles.js`). Every card opens LinkedIn in a new tab.

The SEO consequence: every article earns ranking equity for `linkedin.com`, not for `artisanscloud.com`. Google sees the site as a mostly static marketing brochure with no fresh long-form content on its own domain. The site has no RSS feed and no individual article URLs, so even the topics it does cover send thin signals to search. (Site-wide structured data and social tags already exist as of the metadata work on `main`: `partials/head-meta.html` plus `scripts/lib/page-meta.js` emit Organization and WebSite JSON-LD on the homepage, a BreadcrumbList on every other indexable page, and `twitter:card` tags everywhere. What is still missing is article-level `BlogPosting` schema and the article URLs to attach it to.)

This doc answers two questions: (1) what is the best SEO strategy for blog content going forward, and (2) how good is the existing LinkedIn content if we were to publish it to the site as-is.

---

## 1. SEO Recommendation (the short answer)

**Write articles on artisanscloud.com first. Use LinkedIn as a distribution channel, not as the home of the content.**

Ordering from best to worst for the website's SEO:

1. **Best: Website-first, LinkedIn short-post distribution.** Publish the full article at `https://www.artisanscloud.com/blog/{slug}`. On LinkedIn, share a short *post* (not a Pulse article) with a hook and a link back to the article. The website gets the full article indexed, the backlinks, the rich results, and the keyword rankings. LinkedIn drives traffic.
2. **Acceptable: Website-first, then republish to LinkedIn Pulse later.** Publish on the site, let Google index it for 1 to 2 weeks, then republish to LinkedIn Pulse with a visible "Originally published at artisanscloud.com/blog/..." link at the top. Do not rely on LinkedIn's `rel=canonical`. LinkedIn does not reliably honor cross-domain canonicals, so there is some duplicate-content risk. Google usually picks the older URL, which is why the delay matters.
3. **Worst (status quo): LinkedIn-first with a link from the site.** The site gets zero indexable content, zero backlinks to article URLs, zero long-tail keyword coverage. Move away from this.

**Cross-posting to both simultaneously is not recommended.** LinkedIn ignores canonical tags in practice, so dual publishing creates duplicate content and Google often sides with LinkedIn (higher domain authority than a small marketing site). You end up competing with yourself and losing.

### Why this matters concretely

- **Organic traffic flows to whoever owns the URL.** LinkedIn Pulse sends visitors to LinkedIn, where the CTA is "Follow the author," not "Book a demo." The site sends visitors into the demo funnel.
- **Long-tail keywords compound.** Each article is a new landing page for a specific query ("agentic retail transactions," "unified commerce data models," etc.). Over 12 to 24 months, this is where most SEO-driven demos come from.
- **Internal linking.** Articles on the site can link to `/nexus-unified-commerce`, `/enterprise-ai`, team pages, and each other. Every internal link strengthens topical authority. LinkedIn articles cannot do this.
- **Rich results.** With article-level `BlogPosting` JSON-LD (the `BreadcrumbList` is already auto-generated for indexable pages by `scripts/lib/page-meta.js`), articles become eligible for Google article carousels and author-rich snippets. Not possible when articles live on LinkedIn.
- **Freshness signals.** Schema.org Article signals plus `lastmod` entries in the sitemap are how Googlebot decides when to re-crawl.

---

## 2. Assessment of the Existing LinkedIn Articles

Reviewed nine recent articles (Feb to Apr 2026). Honest assessment: these are **mediocre for SEO in their current form**. The topic choices are right and the writing is competent, but the content has clear AI-generated content patterns that Google's Helpful Content system is designed to deprioritize.

### What is good

- **Topic selection.** Agentic retail, BOPIS/BORIS, auto stock replenishment, ETL for AI, SaaS-to-intelligence shifts: these are genuine high-intent B2B search terms. Solid topical cluster.
- **Reasonable length.** Most articles are 900 to 1,500 words. Long enough to rank.
- **Branded product mentions.** "Unified Commerce Platform," "Knowledge Harvester" appear in context. Good for branded search.
- **Clear heading structure.** H2/H3 hierarchy maps cleanly to HTML. Auto stock replenishment and ETL pipelines articles are the strongest of the set.
- **Some concrete statistics.** The stock replenishment article cites "30% reduction in stock-outs" and "10 to 20% inventory carrying cost reductions." The commerce-interfaces article cites Gartner's 80% B2B projection. These are the good moments.

### What is weak (the SEO-relevant problems)

1. **Strong AI-generation signatures.** Recurring rhetorical patterns that Google's quality classifiers detect:
   - "X is not Y. But Z." openers appear in four of nine articles. ("Commerce isn't disappearing. Its interfaces are." / "SaaS Is not Dead. But..." / "Your next customer will not browse your website. It will query your systems.")
   - Abstract openers with no grounding: "In boardrooms across the world, organizations are investing aggressively...".
   - Portentous closers: "And that begins with..." / "Because in the end...".
   - Stock filler phrases: "In the age of AI," "Forward-looking enterprises," "A fundamental shift," "What comes next".
2. **Missing E-E-A-T signals** (Experience, Expertise, Authoritativeness, Trust, which Google explicitly weighs):
   - No named author bylines, no credentials.
   - No first-hand observations. "At Artisans, we believe" is not a substitute for "In the 40-plus implementations we have shipped, we've consistently seen X."
   - No customer stories, even anonymized. "A Fortune 500 apparel retailer reduced stock-outs 34% after unifying inventory across POS and OMS" is the kind of line that pulls rankings; there is none of it here.
   - No external authoritative citations. "Studies suggest" without naming the study. "Some retailers report" without naming them. Citing McKinsey, Forrester, NRF, specific academic papers (with links) is worth more than any amount of prose.
3. **Semantic redundancy across articles.** "The Silent Cost of Knowledge Loss" and "The Knowledge Crisis no one is talking about" cover essentially the same material. Google's algorithms identify this and consolidate rankings onto one URL, leaving the others stranded.
4. **Thin factual density.** Heavy on declarations, light on evidence. Many bullet lists are abstract concepts rather than concrete items.
5. **Missing SEO boosters.** No tables, no original charts or diagrams, no FAQ sections (which are prime for FAQPage schema and long-tail rankings), no related-reading links.
6. **Grammar and typography issues.** "Documentations lacks," "the impact become significant," inconsistent capitalization in titles ("it's no longer the Advantage."), a few mid-sentence line breaks. Visible quality issues hurt trust signals.

### What to do before publishing any of these to the site

If the goal is to migrate existing LinkedIn articles onto the site, each should be edited to add:

1. A named author byline that links to a team page with credentials.
2. One or two concrete anonymized customer examples with real numbers.
3. Two or three genuine external citations (named sources, with links to the original).
4. Two or three internal links to product/solution pages on the site.
5. A short FAQ section (five Q&As) at the end, eligible for FAQPage structured data.
6. One original visual (a simple inline SVG diagram or a table).
7. Grammar and typography pass.
8. Rewritten opener: kill the "X is not Y" pattern. Open with a specific scene, a number, or a customer moment.
9. A consolidation review: the two knowledge-loss articles should become one strong article, not two thin ones.

This is moderate editing work (roughly 60 to 90 minutes per article), not a full rewrite. The scaffolding is usable.

### Can the same AI workflow keep producing articles?

Yes, but change the process. Use AI for the first draft and topic structuring, then require a human expert pass that adds the things AI cannot fake: a specific customer project, a real number, a named external source, a personal observation. Those human-added elements are where the SEO value lives. Google's Helpful Content update is specifically designed to detect content that has none of them.

---

## 3. Recommended Implementation Approach

Build a **build-time, Markdown-driven blog system** that generates individual `/blog/{slug}` pages during `npm run build`. Keep the LinkedIn cron as a secondary source for now (so historical LinkedIn articles keep showing up in the listing) and author all NEW articles locally. Migrate historical articles opportunistically later, only after the edits listed above.

This mirrors the existing `scripts/generate-team-cards.js` pattern: source of truth in git, generator script emits HTML pages, main Vite plus Handlebars build picks them up, OG images and sitemap extend automatically.

### Authoring workflow

- Articles live as Markdown files under `blog/` at the repo root, one file per article, named `YYYY-MM-DD-slug.md`. `_drafts/` subfolder excluded from the build.
- YAML frontmatter carries the metadata:
  ```yaml
  title, slug, description, publishedAt, updatedAt, author (slug into team-members.json),
  tags, category, hero, heroAlt, canonical (optional), linkedinUrl (optional), draft, featured
  ```
- Author field looks up `assets/data/team-members.json` so the byline, photo, and `/team/{slug}` link come from a single source.

### Build pipeline changes

| File | Change |
|---|---|
| `blog/` (new dir) | Markdown article sources |
| `scripts/lib/blog-articles.js` (new) | Shared loader: reads `blog/*.md` via `gray-matter`, returns canonical article list |
| `scripts/lib/markdown.js` (new) | `marked` config plus `dompurify` sanitizer |
| `scripts/generate-blog-articles.js` (new) | Emits `blog/{slug}.html` plus `assets/data/local-articles.json` (same shape as `fallback-articles.json` with `slug`, `author`, `source: "local"`) |
| `scripts/generate-og-images.js` | Extend with a `local-articles.json` loop producing `assets/og/blog/{slug}.png` (reuse `buildTemplate`) |
| `scripts/generate-sitemap.js` | Add `blog/*.html` discovery with `lastmod = updatedAt \|\| publishedAt`, priority 0.7, changefreq monthly. Delete `blog-detail.html` and remove from `EXCLUDED_PAGES` |
| `scripts/generate-rss.js` (new, Phase 2) | Writes `dist/feed.xml` (RSS 2.0) with full article HTML in `content:encoded` |
| `vite.config.js` | Add `blog/*.html` glob alongside existing `teamFiles` block |
| `assets/script/modules/blog-articles.js` | Import `local-articles.json`, merge with LinkedIn fallback, sort by `publishedAt`, branch card link on `article.source` (local: internal `/blog/{slug}` same-tab; linkedin: external new-tab as today) |
| `assets/style/input.css` | Add a `prose` utility for article body (`h2`/`h3`/`p`/`ul`/`blockquote`/`img`/`code`). Skip `@tailwindcss/typography` (heavier) |
| `api/articles.js` | De-dupe: exclude LinkedIn entries whose URN matches any local article's `linkedinUrl` frontmatter |
| `partials/header.html` | Add only the `<link rel="alternate" type="application/rss+xml">` autodiscovery link. Twitter card meta and Organization/WebSite JSON-LD already ship via `partials/head-meta.html` and `scripts/lib/page-meta.js`; do not duplicate them here. |
| `blog-detail.html` | Delete. Lorem-ipsum placeholder; its markup is copied into the generator template |
| `docs/blog-authoring.md` (new) | Author-facing how-to |
| `docs/dynamic-blog-setup.md` | Note the shift to website-first, LinkedIn now secondary |
| `docs/architecture.md`, `CLAUDE.md`, `AGENTS.md` | Per the project's Documentation Rule: update "Key files," "Gotchas & Landmines," and the commands list |

New npm scripts (`package.json`):

- `build:articles`: runs before `build:css` (Tailwind JIT needs the generated HTML available to scan)
- `build:rss`: after `build:html`
- `generate:articles`, `generate:rss`
- `add:post`: convenience, regenerates articles and OG images

### Per-article page template (generated HTML)

Every generated `blog/{slug}.html` contains:

- Head meta emitted through `scripts/lib/page-meta.js`, the single source root pages and team cards already use, so the unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, OG tags, and `twitter:card` stay consistent with the rest of the site. Add the article-specific `og:type=article`, `article:published_time`, `article:modified_time`, `article:author`, and `article:tag` on that path.
- **JSON-LD `BlogPosting`** (headline, description, image, datePublished, dateModified, author with `sameAs` from team member socials, publisher org, keywords, articleSection, wordCount, inLanguage), emitted by the generator on top of the base meta.
- **JSON-LD `BreadcrumbList`** (Home, Resources, Category, Article). `page-meta.js` already builds this for indexable pages via `buildJsonLd()`; reuse it rather than hand-rolling.
- `{{> header}}` and `{{> footer}}` partials (the existing Vite Handlebars plugin resolves them at build time).
- Article header with breadcrumb, title, tag/date/reading-time meta, author byline linking to `/team/{author-slug}`.
- Hero image.
- Rendered Markdown body inside `.prose` wrapper.
- Footer CTA, LinkedIn/X share buttons, optional "Also on LinkedIn" attribution.
- Similar-insights swiper (reuses `blog-detail.html` markup, wired client-side via `data-exclude-slug`).

### Listing page behavior (unified feed)

- `articles-and-resources.html` and homepage `#insights-grid` keep their empty containers. `blog-articles.js` now merges `local-articles.json` (build-bundled) with LinkedIn fallback and the live `/api/articles` fetch, sorted by `publishedAt` desc.
- Local cards use internal links (same tab, no external arrow). LinkedIn cards keep today's external-link treatment.
- Optional once featured articles exist: a featured-article hero strip above the grid on the listing page.

### Listing and site-wide schema

- `articles-and-resources.html` gets a `Blog` or `CollectionPage` JSON-LD block listing the most recent 10 articles via `blogPost`. Generator writes this into a partial `partials/blog-listing-jsonld.html` which the page includes.
- Site-wide Organization and WebSite JSON-LD already ship on the homepage via `scripts/lib/page-meta.js`, so no new publisher schema is needed here. The only new listing-page work is the `Blog` / `CollectionPage` block above.

### Migration path for the 8 existing LinkedIn articles

Leave them as LinkedIn links for now. Reason: they already have some LinkedIn SEO equity, and moving them into the site without the editing pass described in Section 2 would import weak content onto a clean domain. Win going forward, not retroactively. A Phase 3 `scripts/import-linkedin-article.js` helper can scrape an existing Pulse article via the existing DMA API and write a starter Markdown file to `blog/_drafts/` for editorial review.

### Phasing

**Phase 1 (MVP, ship first):**

1. One genuinely good article written by the owner, with the Section 2 edits applied end-to-end. This validates the pipeline against realistic content.
2. Install `gray-matter`, `marked`, `dompurify` (dev deps).
3. New generator, shared loader, markdown lib.
4. Extend OG image and sitemap generators.
5. Update `vite.config.js` and `assets/script/modules/blog-articles.js`.
6. Add `prose` CSS, delete `blog-detail.html`.
7. Generated pages emit their SEO head through `scripts/lib/page-meta.js` (canonical, OG, Twitter, BreadcrumbList) plus an article-level `BlogPosting` block.
8. Docs updated per CLAUDE.md rule.

**Phase 2 (SEO polish):**

1. RSS feed plus autodiscovery link in header partial.
2. CollectionPage JSON-LD on the listing page.
3. Site-wide Organization/WebSite JSON-LD and `twitter:card` meta: already shipped via `scripts/lib/page-meta.js` and `partials/head-meta.html`, so no further work.
4. Similar-insights swiper wired up to the merged article list.
5. FAQPage JSON-LD support for articles that include a Q&A section.

**Phase 3 (nice to have):**

1. Tag archive pages (`/blog/tag/ai`, `/blog/tag/retail`) reusing the existing 3-tag taxonomy from `api/lib/linkedin.js`.
2. Author archive pages (`/blog/author/{slug}`), cross-linked from team cards.
3. `scripts/import-linkedin-article.js` migration helper.
4. Auto reading-time calculation, heading anchor IDs, optional TOC.

### Non-goals

- No CMS or authoring UI. Markdown in git is the interface.
- No full-text search.
- No comments (engagement lives on LinkedIn posts).
- No incremental builds. Fifty articles render in under a second.

---

## 4. Key Files to Touch (quick reference)

- `scripts/generate-team-cards.js`: exact pattern to mirror for the article generator
- `scripts/generate-og-images.js`: extend with a blog loop (uses `buildTemplate`, Satori plus Sharp)
- `scripts/generate-sitemap.js`: extend discovery and `PAGE_META` for articles
- `vite.config.js`: add `blog/*.html` glob
- `assets/script/modules/blog-articles.js`: merge local and LinkedIn sources, branch on `source`
- `api/articles.js`: de-dupe LinkedIn entries whose URN matches a local article
- `partials/header.html`: RSS autodiscovery link only (Twitter meta and Organization JSON-LD already ship via `partials/head-meta.html` and `scripts/lib/page-meta.js`)
- `scripts/lib/page-meta.js`: the single source for head meta and JSON-LD; extend it for article `BlogPosting` rather than hand-writing head tags
- `assets/data/team-members.json`: read by generator for author byline and JSON-LD
- `assets/style/input.css`: add `prose` utility
- `blog-detail.html`: delete (Lorem-ipsum placeholder)

---

## 5. Verification

After Phase 1 is implemented:

1. `npm run build` completes without errors. `dist/blog/{slug}.html` exists for each Markdown file. `dist/assets/og/blog/{slug}.png` is 1200x630.
2. `dist/sitemap.xml` contains `<loc>https://www.artisanscloud.com/blog/{slug}</loc>` with a correct `<lastmod>`.
3. `npm run dev`, open `http://localhost:3000/blog/{slug}`. Header and footer render, hero loads, Markdown body renders with `prose` styling, no console errors.
4. View page source. Unique `<title>`, canonical, `og:type=article`, Twitter card, both JSON-LD blocks present. Paste JSON-LD into Google's Rich Results Test. No errors.
5. `http://localhost:3000/articles-and-resources`. Merged feed, local articles appear alongside LinkedIn ones, sorted by date. Local cards go to `/blog/{slug}` same-tab. LinkedIn cards open new-tab.
6. Homepage `#insights-grid` shows first 3 of merged feed.
7. `npm test` and `npm run test:e2e` pass. Add an E2E spec that loads `/blog/{first-slug}` and asserts `<h1>`, canonical tag, and JSON-LD presence.
8. After deploy: paste article URLs into Google Search Console URL Inspection, request indexing, verify rich-result eligibility.

---

## 6. Open Questions for the Owner (before implementation)

1. **Authoring surface.** Markdown files in git (proposed) versus a lightweight CMS. Markdown is simpler, faster, and matches the existing "JSON source plus generator" patterns. A CMS adds significant scope.
2. **Scope of the initial engagement.** Is the ask (a) just this strategy decision, or (b) also implement Phase 1 MVP?
3. **Cross-posting going forward.** Preference between tier 1 ("short LinkedIn post linking back to the article," recommended) and tier 2 ("republish to LinkedIn Pulse 1-2 weeks later with attribution link").
4. **Authors.** All articles by existing team members in `team-members.json`, or support guest authors and a default "Artisans Cloud" byline?
5. **Editing the AI drafts.** Is there editorial capacity to do the 60-90 minute edit pass per article described in Section 2, or should we plan to produce fewer but stronger articles instead?
