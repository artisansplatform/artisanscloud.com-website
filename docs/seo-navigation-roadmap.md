# SEO and Navigation Roadmap

Step-by-step plan for restructuring the site IA, replacing duplicate Unified Commerce content, and rolling out a new navigation aimed at enterprise buyers. Each step is sized to be picked up in a separate session.

## Background

- We are restructuring the site for SEO and to attract enterprise buyers.
- PR #48 merged: `/retail-platform` was renamed to `/nexus-unified-commerce` with a 301 redirect.
- PR #50 merged: `/nexus-unified-commerce` content rewritten, FAQ and SoftwareApplication schema added, `/overview` redirected to `/nexus-unified-commerce` and the file deleted, header and footer Overview links removed.
- PR #51 merged: site-wide brand naming sweep. "Artisans" alone and "Artisans Commerce Cloud" replaced with "Artisans Cloud" everywhere except where the legacy name was retired in favor of "Unified Commerce Platform".
- PR #46 (blog SEO strategy doc) is deferred until after the IA changes land. Revisit at Step 8.
- Google Search Console is connected. Data flow is manual; see GSC data flow section below.

## Locked IA

Final structure. Build everything against this.

```
Platform
  Unified Commerce Platform
    Modules: POS, WMS, OMS, D2C eCommerce, CDP, Promotions, Loyalty, Reporting
  Enterprise AI Platform
    Apps: Role Play Agent, Knowledge Harvester
    Retail AI: Image Editing, Smart Auto-Completion, Smart Product Search,
               Personalized Recommendations, Chatbots for Quick Support
  Data Intelligence  (standalone Platform entry, distinct from the data layer
                     inside Unified Commerce, see content note below)

Solutions  (URL pattern: /solutions/<slug>)
  Retail and Omnichannel
  Supply Chain and Planning
  Customer Experience
  (AI for Enterprise: dropped to avoid cannibalizing the Enterprise AI Platform page)

Resources
  Blog
  (Case Studies: deferred until content is ready, omit from nav for now)

Company
  About
  Contact

Primary CTA: Request Demo  (replaces Talk to us)
```

Notes on the locked structure:

- **Data Intelligence content alignment.** Data Intelligence is a standalone Platform entry. Other pages (notably the Unified Commerce page) must not equate the platform's "shared data layer" with the Data Intelligence product. Position the shared data layer as an internal capability of Unified Commerce, and reference Data Intelligence as a complementary standalone platform when relevant.
- **Retail AI pages.** All five existing URLs stay unchanged to preserve SEO equity. They surface in the Platform mega-menu under Enterprise AI Platform as a "Retail AI" subsection. Cross-link from the Retail and Omnichannel Solutions page once that ships. Do not build a `/retail-ai` hub yet, revisit after 30 days of GSC data.
- **Demand Flow.** Default to nesting under a Platform. Revisit after 30 days of GSC data once we know whether it earns direct branded search.

## GSC data flow

GSC is connected. There is no live integration in this repo, so data exchange is manual.

For ongoing analysis, drop monthly CSV exports in `data/gsc/YYYY-MM/`. Folder name uses the **last month covered by the export**, not the date the export was taken. Example: an export downloaded on 2026-05-01 covering 2025-12-17 to 2026-04-30 lives in `data/gsc/2026-04/`. The path is gitignored.

How to export from GSC:

1. Sign in at <https://search.google.com/search-console>.
2. Select the property (`artisanscloud.com`).
3. Sidebar: **Performance** → **Search results**.
4. Click the date chip at the top and set a range. **Last 3 months** is the default; for a baseline that covers pre-rename data, use a custom range starting before March 2026.
5. Top-right: **Export** (box with upward arrow) → **Download CSV**.
6. The download is a zip containing `Queries.csv`, `Pages.csv`, `Countries.csv`, `Devices.csv`, `Dates.csv`, `Search appearance.csv`, `Filters.csv`.
7. Unzip into `data/gsc/YYYY-MM/` using the last month covered by the data (see folder naming note above).

For indexing health (separate from Performance):

- Sidebar: **Indexing** → **Pages**. Review the "Why pages aren't indexed" panel for unexpected errors after URL changes. No useful CSV export here; capture a screenshot or note the counts.

Notes:

- Free GSC export caps at 1000 rows per report. For a site of this size that is enough.
- The **Pages** tab is the most useful for Step 1 (page mapping). Sort by Clicks descending. Anything with meaningful traffic gets a 301, never a delete.
- The **Queries** tab informs keyword targeting for new Solutions pages in Steps 2 and 7.

For one-off questions, paste the relevant slice into chat directly.

Most useful reports for this roadmap:
- Queries and Pages report covering `/nexus-unified-commerce` and `/retail-platform`, to confirm the redirect consolidates impressions cleanly.
- Pages report sorted by clicks, to identify pages that must not be orphaned during Step 6.
- Coverage report, to catch any unexpected de-indexing after URL changes.

Plan to review GSC at Step 1 (page mapping) once there are roughly three weeks of post-rename data.

## Pending decisions

Items that need a decision before the noted step can proceed, plus deferred items waiting on a condition.

### Needed before specific steps

- **Homepage replacement content.** Needed before Step 5. The user will draft and share new homepage content (hero, sections, CTAs) reflecting the locked IA. Until then, Step 5 cannot start. The audit findings in Step 5 below remain useful as input to the new draft.

### Resolved

- **Form backend for `/request-demo`** (Step 3). Use Web3Forms, same as the existing `/contact-us` form (`https://api.web3forms.com/submit`). Tradeoff: this routes submissions to email, not into a CRM. If a CRM is adopted later (HubSpot, Salesforce), `/request-demo` and `/contact-us` can both be migrated together.
- **Brand naming** (cross-cutting). Canonical company brand is **Artisans Cloud**. Do not use bare "Artisans" (too generic to rank, and "Artisan" singular is taken by Artisan AI in adjacent SaaS space). The legacy string "Artisans Commerce Cloud" has been retired site-wide via PR #51; the platform is referred to as "Unified Commerce Platform". Apply consistently across all new content.

### Deferred until conditions are met

- **Demand Flow placement.** Decide after 30 days of GSC.
- **`/retail-ai` hub page.** Decide after 30 days of GSC, based on whether the five Retail AI pages show enough collective traffic to justify a hub.
- **Blog URL pattern: `/blog/` vs `/resources/blog/`.** Decide at Step 1 as part of the page-to-URL map. Step 8 implementation depends on this.
- **Case Studies.** Add nav entry once content is ready.

### Cross-cutting decisions

- **Industries pages.** Whether to plan dedicated `/industries/<sector>` pages later, separate from Solutions pages. Solutions pages frame buyer problems horizontally; Industries pages would frame the same offering vertically by sector. Both can coexist if the keyword strategy is mapped first. Not blocking any step in this roadmap; flag for a future planning round.

## Steps

### Step 1: Page-to-URL mapping

Goal: map every existing HTML page to its destination under the locked IA. Output is a markdown table committed to the repo. No code or content changes ship from this step.

Pull GSC data first (Pages report, last 30 days, sorted by clicks). Pages that earn meaningful traffic must not be deleted or moved without a 301. The map should be informed by traffic, not just intuition.

Tasks:
1. Export GSC Pages report and place CSV in `data/gsc/YYYY-MM/`.
2. Write the IA reference (the locked structure above plus rules for module nesting) into `docs/information-architecture.md`.
3. Fill in the page-to-URL map below. Action options per page: keep at current URL, move with 301, fold into another page with 301, delete.

Most pages ship at their current URL. The Nexus rebrand and the legacy-URL redirects have shipped (PRs #48, #50, #52); the one remaining planned move is the blog (`/articles-and-resources` to `/blog`, Step 8). Disposition values: **keep** (URL unchanged), **redirect stub** (file kept as a meta-refresh stub, edge 301 in `vercel.json`, `sitemap: false`), **rename + 301** (move the file and add a redirect from the old URL), **301 only** (no file, redirect rule in `vercel.json`).

The "New URL" column reads "same" wherever the page keeps its current URL.

| Current URL | Disposition | New URL | Notes |
|---|---|---|---|
| / (homepage) | keep | / | Homepage, rewritten during the Nexus rollout. |
| /nexus-unified-commerce | keep | same | Unified Commerce platform, rebranded "Nexus". `/unified-commerce`, `/retail-platform`, `/overview`, `/solution`, `/artisans-commerce-cloud` all 301 here. |
| /enterprise-ai | keep | same | Enterprise AI platform. `/artificial-intelligence` 301s here. |
| /data-intelligence | keep | same | Data Intelligence platform (standalone). `/business-intelligence` 301s here. |
| /vault-knowledge-harvester | keep | same | "Vault" (Knowledge Intelligence), under Enterprise AI. Renamed from Knowledge Harvester; `/knowledge-harvester` 301s here. |
| /lumen | keep | same | "Lumen" (Enterprise Copilot), under Enterprise AI. New page. |
| /role-play-agent | keep | same | "Arena" (AI Role Play), under Enterprise AI. |
| /POS | keep | same | Point of Sale (Solutions menu). Uppercase URL; case sensitivity noted below. |
| /browser-pos | keep | same | TabsyPOS (Solutions menu). Kept separate from /POS. |
| /merchandise-and-assortment-planning | keep | same | Supply Chain Planning (Solutions menu). `/merchandise-planning`, `/assortment-planning` 301 here. |
| /warehouse-management-system | keep | same | Supply Chain Planning (Solutions menu). |
| /distributed-order-management | keep | same | Nexus OMS module. Footer link. |
| /d2c-eCommerce | keep | same | Nexus D2C module. Footer link. Mixed-case URL; `/d2c-ecommerce`, `/headless-commerce` 301 here. |
| /customer-experience-management | keep | same | Nexus CXM module. Footer link. `/customer-xperience-management`, `/product-xperience-management` 301 here. |
| /automation | keep | same | Nexus Intelligent Automation module. Footer link. |
| /demand-flow | keep | same | Forecasting capability under Nexus. In the sitemap, but not currently linked from header or footer. |
| /image-editing | keep | same | Solutions > Retail AI. |
| /smart-auto-completion | keep | same | Solutions > Retail AI. |
| /smart-product-search | keep | same | Solutions > Retail AI. |
| /personalized-recommendations | keep | same | Solutions > Retail AI. |
| /chatbots-for-quick-support | keep | same | Solutions > Retail AI. |
| /smarter-inventory-alerts | keep | same | Solutions > Retail AI. |
| /customer-feedback-insights | keep | same | Solutions > Retail AI (under "More"). |
| /dynamic-pricing | keep | same | Solutions > Retail AI (under "More"). |
| /store-layout-optimization | keep | same | Solutions > Retail AI (under "More"). |
| /fraud-detection | keep | same | Solutions > Retail AI (under "More"). |
| /personalized-promotions | keep | same | Solutions > Retail AI (under "More"). |
| /open-to-buy-planning | keep | same | Solutions > Retail AI (under "More"). |
| /personalized-customer-experience | keep | same | Solutions > Retail AI (under "More"). |
| /enterprise-data-search | keep | same | Solutions > Retail AI (under "More"). |
| /articles-and-resources | rename + 301 (planned) | /blog | Blog list. Footer link. Move and 301 still pending (Step 8). |
| /blog-detail | keep | same | Blog post template. `sitemap: false`. |
| /about-us | keep | same | Company > About. Top-level nav. `/about` 301s here. |
| /contact-us | keep | same | Company > Contact. Primary CTA ("Talk to us"). |
| /integrations | keep | same | Footer link. `/Integrations` 301s here. |
| /dify-consulting | keep | same | Niche services page. Footer link, omitted from header nav. |
| /request-demo | keep | same | Demo CTA destination plus footer link. noindex, `sitemap: false`. Shipped (was Step 3). |
| /privacy-policy | keep | same | Footer link. |
| /terms-and-conditions | keep | same | Footer link. |
| /thank-you | keep | same | System page. `sitemap: false`. |
| /404 | keep | same | System page. `sitemap: false`. |
| /retail-platform | redirect stub | /nexus-unified-commerce | File kept as a meta-refresh stub. `sitemap: false`. Edge 301 in `vercel.json`. |
| /team/dev-nair | keep | same | Auto-generated team card. |
| /team/gaurav-makhecha | keep | same | Auto-generated team card. |

### Sub-decisions surfaced during mapping

- **Nexus rebrand.** Unified Commerce shipped as "Nexus" at `/nexus-unified-commerce` (PRs #48 and #50). The earlier assumption of `/unified-commerce` as the canonical URL was superseded; `/unified-commerce` now 301s to the Nexus URL.
- **Solutions mega-menu.** Shipped as a product grouping (Retail AI, Point of Sale, Supply Chain Planning), not the `/solutions/<slug>` buyer-problem pages described in Steps 2 and 7. Those pages have not shipped. Decide whether they coexist with or replace the current grouping before building them.
- **URL case sensitivity.** Vercel routing is case-sensitive. `/d2c-eCommerce` and `/POS` work; their lowercase variants 404. Lowercase redirects were added in PR #52 to recover SEO equity. Long-term recommendation: rename the files to lowercase (`d2c-ecommerce.html`, `pos.html`) with 301s from the current casing. Worth doing during Step 6 (page audit and redirect map) since it touches multiple files.
- **Blog URL pattern: `/blog`.** Resolved to flat `/blog` rather than `/resources/blog/`. Rationale in `docs/information-architecture.md`. The move and 301 are still pending (Step 8); the footer currently links `/articles-and-resources`.

Done when:
- `docs/information-architecture.md` exists with the locked IA and module nesting rules.
- Every existing page has a row with a non-TBD action.
- Decisions are informed by the GSC Pages report.

### Step 2: Build the Retail and Omnichannel Solutions page

Goal: ship one substantive Solutions page before the nav rollout. The other Solutions pages can ship in later rounds.

Why this one first: enterprise retailers are the primary ICP, so this Solutions page has the highest commercial intent and SEO leverage.

Tasks:
1. URL: `/solutions/retail-omnichannel` (locked nested pattern per IA).
2. Keyword research:
   - Primary keyword must be different from `/nexus-unified-commerce` to avoid cannibalization.
   - Candidates to evaluate: "omnichannel retail solutions", "enterprise omnichannel platform", "unified retail operations".
   - Use a free keyword tool (Ahrefs free, Ubersuggest, or GSC) to validate volume and intent.
3. Draft 800 to 1500 words structured as:
   - Buyer problem (omnichannel pain points enterprise retailers face).
   - Capabilities (how Artisans Cloud solves it).
   - Outcomes (measurable results).
   - Proof (logos or case study refs once available).
   - FAQ block (3 to 5 questions).
4. Internal links: into Unified Commerce Platform, POS, WMS, OMS, D2C eCommerce module pages.
5. Meta title and description targeting the primary keyword.
6. Add OG image entry, run `npm run generate:og`.
7. Add to sitemap.
8. JSON-LD `FAQPage` schema for the FAQ block.
9. E2E test for the page.

Done when:
- Page lives at the chosen URL with full content.
- `npm run build`, `npm test`, `npm run test:e2e` all pass.
- Primary keyword for this page is documented and confirmed distinct from `/nexus-unified-commerce`.

### Step 3: Build the Request Demo page

Goal: ship a destination that matches the "Request Demo" promise so the new nav can route to it on day one.

Why before Step 4: the nav rollout will change the primary CTA from "Talk to us" to "Request Demo". A buyer clicking "Request Demo" and landing on a generic contact form is a credibility hit at the highest-intent moment on the site.

Tasks:
1. Create `/request-demo` (file: `request-demo.html`). Use `{{> header}}` and `{{> footer}}` partials.
2. Form fields (enterprise-style, not a generic message box): name, work email, company, role/title, company size or revenue band, current systems (free text or multi-select), timeline, optional message.
3. Form backend: post to Web3Forms (`https://api.web3forms.com/submit`), matching the existing `/contact-us` flow. Reuse the markup pattern from `contact-us.html` for consistency. Tradeoff to remember: submissions go to email, not into a CRM. If a CRM is adopted later, both `/contact-us` and `/request-demo` migrate together.
4. Add a thank-you state (could reuse `thank-you.html` or be inline).
5. Light, on-brand layout. No heavy hero. The page is a form, not a marketing page.
6. Meta tags:
   - Title: `Request a Demo | Artisans Cloud`
   - Description: short and intent-matching. No need to optimize for organic discovery; this page is destination only and should be `noindex` (`<meta name="robots" content="noindex">`).
7. OG image entry in `scripts/generate-og-images.js` and run `npm run generate:og` (used if anyone shares the URL even though the page is noindex).
8. Update `scripts/generate-sitemap.js` to exclude `/request-demo` from the sitemap (since it is noindex).
9. Keep `/contact-us` for general inquiries. Add a small footer link from `/request-demo` to `/contact-us` for visitors who landed here but want a non-sales conversation.
10. E2E test:
    - Page renders.
    - Form validates required fields.
    - Submission posts to the chosen backend (or stubbed endpoint in test mode).
    - Thank-you state shows on success.

Done when:
- `/request-demo` is live, form submits to the chosen backend, thank-you state appears.
- `noindex` confirmed via view source.
- Not in sitemap.
- E2E passes.

### Step 4: Ship the new navigation

Prerequisites: Steps 1, 2, and 3 are done. Shipping the nav before a Solutions page exists creates thin links from the most-clicked surface on the site. Shipping it before `/request-demo` exists wastes the highest-intent click.

Scope is the nav copy and structure only.

Tasks:
1. Update `partials/header.html` (desktop and mobile) with the locked IA structure.
2. Update `partials/footer.html` sitemap section to mirror the new IA. Omit Case Studies until that page exists.
3. Replace the "Talk to us" CTA copy with "Request Demo" and route the link to `/request-demo`. Update the icon `alt` text accordingly.
4. Search the codebase for other "Talk to us" references and align them: `grep -r "Talk to us" --include="*.html" --include="*.js"`.
5. If GA4 or other event tracking exists on the CTA, update event names so pre and post-change conversion data does not silently merge. Document the change.
6. Test the mobile menu at 393px. Five dropdowns means more vertical scroll; verify it still feels usable.
7. E2E tests:
   - Every nav link reaches a 200 response.
   - Each dropdown opens and closes (desktop hover and click, mobile tap).
   - Mobile menu opens, closes, and traps focus correctly.
   - The "Request Demo" CTA navigates to `/request-demo` from every breakpoint.

Done when:
- All breakpoints render the new nav correctly (393px, 768px, 1280px).
- No 404s from any nav link.
- E2E covers desktop and mobile nav paths.
- No stray "Talk to us" copy remains in user-facing files.

### Step 5: Reposition the homepage

Goal: align the homepage hero and primary CTAs with the locked Platform / Solutions IA so visitors do not get a retail-only first impression that contradicts the new nav.

Why after Step 4: shipping the new nav with a retail-anchored homepage looks disjointed. The homepage and nav should land coherently.

**Status: blocked on content.** The user is drafting the new homepage content (hero, section structure, CTAs) and will share before this step starts. The audit findings below describe the problems to solve and remain useful as input to that draft. Do not start implementation until the new content is shared.

Findings driving this step (from the audit of `index.html`):
- Hero H1 is retail-and-supply-chain only ("Streamline, Optimize, and Align Retail Planning and Supply Chain Operations"), contradicting the meta title "Intelligent Enterprise Transformation".
- Both hero CTAs link to `/nexus-unified-commerce`, forcing every interested visitor into the retail funnel.
- Hero floating cards are three-of-four retail.
- The mid-page "Drive Sales" CTA section is 100% retail copy targeting "retailers".
- Our Core Verticals, Intelligent Enterprise Transformation, Strategic Impact Snapshot, and Insights sections are already sector-neutral. They do not need rework.

Tasks (apply once the new content draft arrives):
1. Rewrite hero H1 to support all three Platforms. Candidate phrasings to consider unless the new draft already has one:
   - "Engineer the Intelligent Enterprise"
   - "Unify Data, AI, and Commerce in a Single Platform"
   - "The Operating System for the Intelligent Enterprise"
2. Update the hero subtext to reinforce the Platform positioning, not retail.
3. Split the hero CTAs:
   - Primary: "Request Demo" linking to `/request-demo`.
   - Secondary: "Explore Platforms" scrolling to the Our Core Verticals section, or linking to a future `/platforms` overview if one exists by then.
4. Rebalance the hero floating cards. Suggested mix: Unified Commerce, Decision Intelligence, Enterprise AI, plus one cross-cutting concept (for example, Predictive Operations). Replace assets accordingly.
5. Replace or rewrite the Drive Sales CTA section (`index.html:339-355`):
   - Option A: Sector-neutral rewrite focused on outcomes (efficiency, decision speed, margin) without the word "retailer".
   - Option B: Replace with a three-column block summarizing the three Platforms with deep-link buttons to `/nexus-unified-commerce`, `/data-intelligence`, `/enterprise-ai`.
   - Recommend Option B; it strengthens internal linking to all three Platform pages.
6. Add a small "Industries we serve" strip near the client logo marquee, listing the sectors named in the Sector Expertise card.
7. Audit client logos. If most logos are retail brands, reorder the marquee so the first visible logos are a mixed sequence. If non-retail logos do not exist yet, decide whether to source one or two before this step ships.
8. Clean up the hyphen-as-dash on `index.html:232`. Replace with a comma or rephrase per the project writing rule.
9. Remove the `meta name="keywords"` tag (`index.html:14-15`). Google has ignored it for over a decade and it tips targeting to competitors.
10. Regenerate the homepage OG image if hero copy changes substantively (`scripts/generate-og-images.js` plus `npm run generate:og`).
11. Update meta description if the hero rewrite shifts positioning enough to warrant it.
12. E2E:
    - Hero CTAs route to the correct destinations.
    - "Industries we serve" strip renders at all breakpoints.
    - No regressions in Core Verticals, Intelligent Enterprise, Strategic Impact, Insights sections.

Done when:
- Hero H1, CTAs, and floating cards no longer signal retail-only.
- Drive Sales CTA section is sector-neutral or replaced.
- Industries strip lists the locked sector list.
- Meta tags cleaned up.
- E2E passes at 393px, 768px, 1280px.

### Step 6: Page audit and redirect map

Goal: clean up every page that did not get a clear home in the new IA.

Tasks:
1. Re-read the page mapping from Step 1.
2. For each "redirect" or "fold into" action, add the rule to `vercel.json`.
3. For each "delete" action, remove the file and confirm no internal links remain (`grep -r "/page-slug" --include="*.html" --include="*.js" --include="*.json"`).
4. Update `scripts/generate-sitemap.js` and rebuild.
5. Update tests to remove references to deleted pages.

Done when:
- Every existing HTML page has a defined disposition (kept, redirected, or deleted).
- `vercel.json` contains all redirects.
- `npm test` passes (link validation catches broken internal links).

### Step 7: Build the remaining Solutions pages

One page per PR. Order:
1. Supply Chain and Planning at `/solutions/supply-chain-planning`
2. Customer Experience at `/solutions/customer-experience`

(AI for Enterprise as a Solutions page is dropped per locked IA, to avoid cannibalizing the Enterprise AI Platform page. If we later want a buyer-problem framing for AI, reframe sections of the Enterprise AI Platform page itself rather than adding a new page.)

Reuse the structure from Step 2.

### Step 8: Revisit PR #46 (blog SEO strategy)

Reasons to defer until now:
- Blog URL slug strategy depends on whether blog lives under `/blog/` or `/resources/blog/`, which is decided in Step 1.
- Internal linking strategy depends on which Platform, Solutions, and Module pages exist.

Tasks:
1. Re-read PR #46 doc with the new IA in mind.
2. Update the doc to reflect final URL structure.
3. Plan the implementation PR (build-time Markdown to HTML, mirroring `generate-team-cards.js`).

## Cross-cutting checklist

Apply to every PR in this roadmap:

- No em dashes in any file. Use commas, periods, colons, or parens.
- No emojis in user-facing content.
- Use "Artisans Cloud" as the canonical company name. Do not introduce "Artisans" alone or "Artisans Commerce Cloud".
- All pages use `{{> header}}` and `{{> footer}}` partials.
- Clean URLs in links: `/page`, not `/page.html`.
- Responsive at 393px, 768px, 1280px.
- `npm run build` succeeds.
- `npm test` passes.
- `npm run test:e2e` passes for affected pages.
- OG image generated for new pages (`scripts/generate-og-images.js` plus `npm run generate:og`).
- Sitemap regenerated.
- Relevant docs updated per the Documentation Rule in `CLAUDE.md`.
