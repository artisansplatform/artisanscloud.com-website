# Information Architecture

Canonical reference for the site's information architecture. Every navigation change, new page, and redirect should align with this doc. Sourced from the locked IA decisions in `docs/seo-navigation-roadmap.md`.

## Top-level navigation

```
Platform
Solutions
Resources
Company

Primary CTA: Request Demo  (replaces "Talk to us")
```

## Full structure

### Platform (mega-menu)

```
Platform
├── Unified Commerce Platform   → /unified-commerce
│   Modules in mega-menu:
│   ├── POS                                 → /POS
│   ├── TabsyPOS                            → /browser-pos
│   ├── Warehouse Management                → /warehouse-management-system
│   ├── Distributed Order Management        → /distributed-order-management
│   ├── D2C eCommerce                       → /d2c-eCommerce
│   ├── Customer Experience Management      → /customer-experience-management
│   ├── Merchandise and Assortment Planning → /merchandise-and-assortment-planning
│   ├── Intelligent Automation              → /automation
│   └── Demand Flow                         → /demand-flow
│
├── Enterprise AI Platform   → /enterprise-ai
│   Apps:
│   ├── Role Play Agent       → /role-play-agent
│   └── Knowledge Harvester   → /knowledge-harvester
│   Retail AI (subsection):
│   ├── Image Editing                  → /image-editing
│   ├── Smart Auto-Completion          → /smart-auto-completion
│   ├── Smart Product Search           → /smart-product-search
│   ├── Personalized Recommendations   → /personalized-recommendations
│   └── Chatbots for Quick Support     → /chatbots-for-quick-support
│
└── Data Intelligence   → /data-intelligence
    (No sub-pages currently. The page itself is the Platform page.)
```

### Solutions (mega-menu)

URL pattern: `/solutions/<slug>`

```
Solutions
├── Retail and Omnichannel       → /solutions/retail-omnichannel       (Step 2)
├── Supply Chain and Planning    → /solutions/supply-chain-planning    (Step 7)
└── Customer Experience          → /solutions/customer-experience      (Step 7)
```

AI for Enterprise was considered as a fourth Solutions page but dropped from the locked IA to avoid cannibalizing the Enterprise AI Platform page.

### Resources

```
Resources
├── Blog          → /blog       (currently /articles-and-resources, see "Decisions made" below)
└── Case Studies  (deferred until content is ready, omit from nav for now)
```

### Company

```
Company
├── About    → /about-us
└── Contact  → /contact-us
```

### Footer-only and utility pages

Not in the primary nav. Linked from footer or used as system pages.

```
Footer links:
├── Privacy Policy        → /privacy-policy
├── Terms and Conditions  → /terms-and-conditions
└── Integrations          → /integrations  (also worth surfacing on Platform pages where relevant)

System pages:
├── 404                   → /404
├── Thank you             → /thank-you
├── Blog detail template  → /blog-detail
└── Request Demo (Step 3) → /request-demo  (noindex; not in sitemap; CTA destination only)

Team pages (auto-generated from team-members.json):
└── /team/<slug>          (currently /team/dev-nair, /team/gaurav-makhecha)
```

### Page that does not fit cleanly

- **`/dify-consulting`**: a services page about Dify consulting. Not a Platform, App, Solution, or Module. Two options:
  - **Recommended:** keep at current URL, link from the Enterprise AI Platform page where contextually relevant, omit from main nav.
  - Alternative: fold the content into the Enterprise AI Platform page and 301 the slug.

## Module nesting rules

Rules for deciding where a new page goes.

1. **Platform pages** are horizontal foundations. Everything else either runs on top of them or sells them. Three Platforms today: Unified Commerce, Enterprise AI, Data Intelligence. New ones are rare and require explicit business buy-in.

2. **Modules** are sub-systems of a Platform. They share the Platform's data and architecture. POS, OMS, WMS, CDP-equivalent are modules of Unified Commerce. New module pages live as flat top-level URLs (not `/unified-commerce/pos`) to preserve flexibility, but they appear nested in the Platform's mega-menu. They link back to the Platform page via internal links.

3. **Apps** are AI products built on the Enterprise AI Platform. Role Play Agent, Knowledge Harvester are Apps. New AI products are Apps unless they are pure horizontal infrastructure (in which case they extend the Platform itself).

4. **Retail AI** is a subsection of Enterprise AI Platform that groups eCommerce-specific AI features (Image Editing, Smart Search, etc.). New eCommerce AI features go here.

5. **Solutions** are buyer-problem framings, not products. URL pattern `/solutions/<slug>`. Each Solutions page targets a distinct primary keyword (no cannibalization with Platform pages). Solutions pages link out to the Platform and Module pages that solve the problem.

6. **Resources** are content surfaces. Blog and Case Studies for now. New marketing content (whitepapers, ebooks) goes here, not under Platform.

7. **Footer-only** is for compliance, system, and supporting pages. Visible in footer, not in main nav.

## Decisions made during this mapping

### Blog URL pattern

**Decision: move to `/blog`** (was `/articles-and-resources`).

Rationale:
- `/articles-and-resources` is verbose and not a standard pattern.
- GSC shows minimal traffic to either the current URL or its old `/blog-list` form (36 quarterly impressions, 0 clicks combined). Almost no SEO equity to lose.
- `/blog` is the standard, expected, and cleaner.
- Implementation: rename file, add 301 from `/articles-and-resources` to `/blog`, update internal links and sitemap. This work happens in Step 8 (blog SEO strategy) since that's where the blog gets restructured anyway.

### Demand Flow placement

**Decision: nest under Unified Commerce Platform.**

Rationale:
- Per the locked IA, the deferred decision was: nest under a Platform unless GSC shows direct branded search demand.
- GSC data shows zero clicks and the page is not in the top-30 pages by impressions. No branded search demand to preserve.
- Demand Flow is a forecasting and demand-sensing capability, naturally a sibling of Inventory Management and Merchandise Planning under Unified Commerce.

### TabsyPOS (`/browser-pos`)

**Decision: keep separate from `/POS`, both nest under Unified Commerce Platform.**

Rationale:
- `/browser-pos` has 274 quarterly impressions and 5 clicks (1.82% CTR), which is small but not zero.
- `/POS` has 398 impressions, 0 clicks. Different audiences (TabsyPOS is the browser-based variant).
- Folding into `/POS` would lose the distinct positioning and the 5 clicks. Keep separate, expose both in the Platform mega-menu.

### `/integrations` placement

**Decision: footer link plus contextual mention on Platform pages.**

Rationale:
- 22 quarterly impressions, 1 click, position ~6.8 (good ranking but tiny query volume).
- Content is a list of integration partners, useful for buyers in evaluation but not a top-of-funnel page.
- Surface in the footer and link from "Built for Enterprise Scale" or "Architecture" sections of Platform pages.

### `/dify-consulting` placement

**Decision: keep at current URL, omit from main nav.**

Rationale:
- Niche services page, not a Platform/App/Solution.
- Has its own SEO equity (specific keyword targeting) so a redirect would lose visibility.
- Link contextually from Enterprise AI Platform if relevant; otherwise live as a discoverable but unlinked page.

### `/retail-platform`

**Decision: delete the file. Redirect already handled in `vercel.json` (PR #48).**

The file currently contains a 10-line stub left from the rename. It serves no purpose because the URL is permanently redirected at the edge. Deleting the file removes ambiguity.

## Rules for adding new pages

When proposing a new page:

1. **Identify the bucket.** Platform, Module, App, Solution, Resource, or Footer. If none fit, the page might not belong on the marketing site.
2. **Check for keyword cannibalization.** If a Platform or Module page already targets the same primary keyword, the new page is likely redundant. Reframe or fold.
3. **Confirm internal-link targets exist.** A new page should both link out (to Platform / Module pages where relevant) and be linked into (from at least one parent surface).
4. **Add to the mapping table** in `docs/seo-navigation-roadmap.md` (Step 1 table) so the disposition is recorded.
5. **Add to nav** if appropriate. Footer-only pages do not enter the header nav.
6. **Add OG image** (`scripts/generate-og-images.js`) and **sitemap** (`scripts/generate-sitemap.js`).
7. **Update this doc** if the new page changes the structure.
