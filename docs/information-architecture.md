# Information Architecture

Canonical reference for the site's information architecture. Every navigation change, new page, and redirect should align with this doc.

This describes the structure as currently shipped (see `partials/header.html` and `partials/footer.html`). Where the SEO/navigation roadmap (`docs/seo-navigation-roadmap.md`) still has forward-looking items that have not shipped, they are flagged as planned rather than presented as fact.

## Top-level navigation

The header surfaces the three platforms directly. The "Platform / Solutions / Resources / Company" grouping that earlier drafts of this doc proposed was not adopted.

```
Unified Commerce   → /nexus-unified-commerce   (direct link, no sub-menu)
Enterprise AI      (mega-menu)
Data Intelligence  → /data-intelligence         (direct link, no sub-menu)
Solutions          (mega-menu)
About Us           → /about-us

Primary CTA: Talk to us → /contact-us
```

A Request Demo page exists at `/request-demo` (noindex, not in the sitemap). It is the destination for demo CTAs and is linked from the footer. The header CTA currently reads "Talk to us" and points at `/contact-us`.

## Full structure

### Unified Commerce → /nexus-unified-commerce

Top-level link, no sub-menu in the header. The platform was rebranded "Nexus." Its modules are surfaced under the Solutions mega-menu (Point of Sale, Supply Chain Planning) and in the footer (Automation, Distributed Order Management, D2C eCommerce, Customer Experience Management).

### Enterprise AI (mega-menu)

```
Enterprise AI
├── Enterprise AI Overview        → /enterprise-ai
├── Knowledge Intelligence: Vault → /vault-knowledge-harvester
├── Enterprise Copilot: Lumen     → /lumen
└── AI Role Play: Arena           → /role-play-agent
```

Vault is the renamed Knowledge Harvester (old `/knowledge-harvester` 301s here). Lumen and Arena are newer product pages.

### Data Intelligence → /data-intelligence

Top-level link, no sub-menu.

### Solutions (mega-menu)

Three groups. This is where the use-case pages live.

```
Solutions
├── Retail AI
│   ├── Image Editing                    → /image-editing
│   ├── Smart Auto-Completion            → /smart-auto-completion
│   ├── Smart Product Search             → /smart-product-search
│   ├── Personalized Recommendations     → /personalized-recommendations
│   ├── Chatbots for Quick Support       → /chatbots-for-quick-support
│   ├── Smarter Inventory Alerts         → /smarter-inventory-alerts
│   │   (revealed under "More":)
│   ├── Customer Feedback Insights       → /customer-feedback-insights
│   ├── Dynamic Pricing                  → /dynamic-pricing
│   ├── Store Layout Optimization        → /store-layout-optimization
│   ├── Fraud Detection                  → /fraud-detection
│   ├── Personalized Promotions          → /personalized-promotions
│   ├── Open-to-Buy Planning             → /open-to-buy-planning
│   ├── Personalized Customer Experience → /personalized-customer-experience
│   └── Enterprise Data Search           → /enterprise-data-search
│
├── Point of Sale
│   ├── POS System → /POS
│   └── TabsyPOS   → /browser-pos
│
└── Supply Chain Planning
    ├── Merchandise and Assortment Planning → /merchandise-and-assortment-planning
    └── Warehouse Management System         → /warehouse-management-system
```

This "Solutions" menu is a product and capability grouping. It is not the `/solutions/<slug>` buyer-problem pages described in the roadmap (Steps 2 and 7). Those pages have not shipped. If they do, decide whether they coexist with or replace this grouping.

### Company

```
About    → /about-us       (top-level nav)
Contact  → /contact-us      (primary CTA "Talk to us")
```

### Footer-only and utility pages

Linked from the footer or used as system pages. Not in the header nav.

```
Footer links (beyond the nav pages above):
├── Articles and Resources         → /articles-and-resources   (blog list; the /blog move is still planned, see roadmap Step 8)
├── Automation                     → /automation                (Nexus module)
├── Distributed Order Management   → /distributed-order-management  (Nexus module)
├── D2C eCommerce                  → /d2c-eCommerce             (Nexus module)
├── Customer Experience Management → /customer-experience-management  (Nexus module)
├── Integrations                   → /integrations
├── Dify Consulting                → /dify-consulting
├── Request Demo                   → /request-demo              (noindex; CTA destination)
├── Privacy Policy                 → /privacy-policy
└── Terms and Conditions           → /terms-and-conditions

System pages:
├── 404                  → /404
├── Thank you            → /thank-you
└── Blog detail template → /blog-detail   (not in sitemap)

Redirect stubs (file kept, edge 301 in vercel.json):
└── /retail-platform → /nexus-unified-commerce

Team pages (auto-generated from team-members.json):
└── /team/<slug>   (currently /team/dev-nair, /team/gaurav-makhecha)
```

### Pages that exist but are not in the primary nav

- **`/demand-flow`**: present and in the sitemap, but not linked from the header or footer. A forecasting and demand-sensing capability under Nexus, a natural sibling of Merchandise Planning. Surface it from the Nexus page or the Supply Chain Planning group if it should be discoverable.
- **`/dify-consulting`**: niche services page. Footer link, omitted from the header nav. It has its own SEO equity, so it keeps its URL.

## Module nesting rules

Rules for deciding where a new page goes.

1. **Platform pages** are horizontal foundations. Everything else either runs on top of them or sells them. Three platforms today: Nexus Unified Commerce (`/nexus-unified-commerce`), Enterprise AI (`/enterprise-ai`), Data Intelligence (`/data-intelligence`). New ones are rare and require explicit business buy-in.

2. **Modules** are sub-systems of the Nexus Unified Commerce platform. They share its data and architecture: POS, OMS, WMS, Merchandise Planning, Automation, D2C, CXM. New module pages live as flat top-level URLs (not `/nexus-unified-commerce/pos`) to preserve flexibility. They are surfaced in the Solutions mega-menu (Point of Sale, Supply Chain Planning) and the footer, and link back to the Nexus page.

3. **Apps** are AI products built on the Enterprise AI platform: Vault, Lumen, Arena. New AI products are Apps unless they are pure horizontal infrastructure (in which case they extend the platform itself).

4. **Retail AI** groups eCommerce-specific AI features (Image Editing, Smart Search, Dynamic Pricing, and so on). It is surfaced under the Solutions mega-menu. New eCommerce AI features go here.

5. **The Solutions mega-menu** currently groups product capabilities (Retail AI, Point of Sale, Supply Chain Planning). The roadmap's buyer-problem `/solutions/<slug>` pages are a separate, not-yet-shipped concept. Keep the two distinct when planning.

6. **Resources** are content surfaces. The blog (Articles and Resources) for now, Case Studies once content is ready. New marketing content goes here, not under a platform.

7. **Footer-only** is for compliance, system, and supporting pages. Visible in the footer, not in the header nav.

## Decisions made, and what actually shipped

### Nexus rebrand

Unified Commerce shipped as "Nexus" at `/nexus-unified-commerce` (PRs #48 and #50). The earlier assumption that the canonical URL would be `/unified-commerce` was superseded. `/unified-commerce`, `/retail-platform`, `/overview`, `/solution`, and `/artisans-commerce-cloud` all 301 to the Nexus URL.

### Knowledge Harvester became Vault

Renamed to "Vault" (Knowledge Intelligence) at `/vault-knowledge-harvester`. `/knowledge-harvester` 301s here. It sits under the Enterprise AI mega-menu.

### New Enterprise AI products

Lumen (`/lumen`, Enterprise Copilot) and Arena (`/role-play-agent`, AI Role Play) joined Vault under the Enterprise AI menu.

### Solutions mega-menu

Shipped as a product grouping (Retail AI, Point of Sale, Supply Chain Planning), not the `/solutions/<slug>` buyer-problem pages described in the roadmap. Those remain a roadmap item.

### Blog URL pattern

**Decision: move to `/blog`** (from `/articles-and-resources`).

Rationale: `/articles-and-resources` is verbose, and GSC showed near-zero traffic to either the current URL or its old `/blog-list` form, so there is little SEO equity to lose. The move and 301 are still pending and happen in Step 8 (blog SEO strategy), where the blog gets restructured anyway. The footer currently links `/articles-and-resources`.

### Demand Flow placement

Originally decided to nest under Unified Commerce. The page exists and is in the sitemap, but it is not currently surfaced in the header or footer nav. GSC showed no branded search demand, so there is nothing to preserve by promoting it.

### TabsyPOS (`/browser-pos`)

Kept separate from `/POS`. Both sit under Solutions > Point of Sale. They serve different audiences (TabsyPOS is the browser-based variant), and `/browser-pos` has its own clicks, so folding it into `/POS` would lose that positioning.

### `/integrations` placement

Footer link. Low query volume but a useful evaluation-stage page. Surface contextually from platform pages where relevant.

### `/dify-consulting` placement

Kept at its current URL, omitted from the header nav, linked from the footer. It is a niche services page with its own keyword targeting, so a redirect would lose visibility.

### `/retail-platform`

Kept as a meta-refresh redirect stub to `/nexus-unified-commerce` (`sitemap: false`), not deleted. The edge 301 lives in `vercel.json`. An earlier draft proposed deleting the file; keeping the stub is harmless and the edge redirect is what matters.

### Request Demo

Shipped at `/request-demo` (noindex, `sitemap: false`). It is the demo CTA destination and a footer link. The header CTA still reads "Talk to us" and points at `/contact-us`.

## Rules for adding new pages

When proposing a new page:

1. **Identify the bucket.** Platform, Module, App, Retail AI feature, Resource, or Footer. If none fit, the page might not belong on the marketing site.
2. **Check for keyword cannibalization.** If a platform or module page already targets the same primary keyword, the new page is likely redundant. Reframe or fold.
3. **Confirm internal-link targets exist.** A new page should both link out (to platform or module pages where relevant) and be linked into (from at least one parent surface: a mega-menu group or the footer).
4. **Add to the mapping table** in `docs/seo-navigation-roadmap.md` (Step 1 table) so the disposition is recorded.
5. **Add to nav** if appropriate. Footer-only pages do not enter the header nav.
6. **Add metadata to `assets/data/pages.json`** (title, description, canonical, `ogCard`, sitemap entry), then **add an OG image** (`npm run generate:og`) and confirm the **sitemap** picks it up (`scripts/generate-sitemap.js`).
7. **Update this doc** if the new page changes the structure.
