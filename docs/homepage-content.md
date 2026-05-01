# Homepage: Merged Content Draft

This is the proposed content for `index.html` once Step 5 (Reposition the homepage) begins. It merges the new content draft (`~/Downloads/Home Page.docx`) with three credibility elements preserved from the existing homepage: client logo marquee, Strategic Impact Snapshot, and Insights and Leadership.

Per the writing rules in `CLAUDE.md`: no em dashes, no emojis, straight quotes, plain language.

Word count target: kept tight (~500 words visible) since homepages rank on brand and links rather than content depth. Credibility elements (logos, metrics, blog cards) carry the rest of the weight.

---

## Meta

- **Title:** Enterprise Systems for Commerce, AI, and Data | Artisans Cloud
- **Description:** Enterprise systems for unified commerce, enterprise AI, and data intelligence. Built for large-scale retail, automotive, and manufacturing operations.
- **Canonical:** https://www.artisanscloud.com/
- **OG image:** /assets/og/index.png (existing, may need refresh once visuals are decided)

Suggested JSON-LD: `Organization` schema with the three Platforms as `hasOfferCatalog` items. Optional and can ship in a later pass.

---

## Section 1: Hero

**H1:** Unified Commerce, Enterprise AI, and Data Intelligence

**Subhead:** Designed for large-scale, complex enterprise environments.

**Body:** Artisans Cloud builds enterprise-grade systems for retail operations, AI-driven workflows, and data-led decision-making across the business.

**CTAs (two buttons side-by-side):**
- Primary: **Request a Demo** (links to `/request-demo` once it exists; until Step 3 ships, link to `/contact-us`)
- Secondary: **Explore Platforms** (anchor link to `#platforms`, scrolling to the three-card section below)

**Visual:** Reuse the existing hero floating-cards layout, but rebalance the four cards to one per Platform plus one cross-cutting concept. Suggested labels: Unified Commerce, Enterprise AI, Data Intelligence, Predictive Operations. Replace assets where needed.

---

## Section 2: Our Clients and Partners (preserved from existing)

Keep the existing client logo marquee component (`ourClientMaruqee` swiper). No content change required. If the logo set is mostly retail brands, reorder so the first visible logos are a mixed sequence (retail + non-retail). If non-retail logos are not yet available, source one or two before this homepage ships.

---

## Section 3: What We Offer

**Heading:** What We Offer

**Body:**

Artisans Cloud delivers systems across three areas, each designed to solve a specific class of problem. They can also work together to improve coordination across the business.

The focus is on reducing the gap between decision and execution so teams can act immediately, without waiting on systems to sync.

**Anchor target:** Add `id="platforms"` to this section's container so the hero "Explore Platforms" CTA scrolls here.

---

## Section 4: Three Platform Cards

Render as a three-card grid (existing pattern from "Our Core Verticals" can be reused with new content).

**Card 1: Unified Commerce Platform**
A full-stack system for managing inventory, orders, customers, and omnichannel operations across stores and digital channels.
CTA: **Explore Unified Commerce Platform** → `/unified-commerce`

**Card 2: Enterprise AI Platform**
AI systems built for production workflows, supporting training, knowledge activation, and decision-making across teams.
CTA: **Explore Enterprise AI Platform** → `/enterprise-ai`

**Card 3: Data Intelligence**
A structured data foundation that enables visibility, reporting, and real-time decision-making across enterprise systems.
CTA: **Explore Data Intelligence** → `/data-intelligence`

---

## Section 5: Unified Commerce for Retail Operations

**Heading:** Unified Commerce for Retail Operations

**Body:** Manage inventory, orders, and customer experience across all channels in a system designed for multi-location retail.

**Bullets:**
- Real-time inventory visibility across stores and warehouses
- Centralized order management across channels
- Consistent customer experience across online and offline
- Integrated promotions, loyalty, and customer data

**Optional inline link:** "Learn more about the Unified Commerce Platform" linking to `/unified-commerce`.

---

## Section 6: AI for Enterprise Workflows

**Heading:** AI for Enterprise Workflows

**Body:** Apply AI directly to everyday operational workflows.

**Bullets:**
- Role-based training through simulation
- Capture and activate enterprise knowledge
- Interact with data using natural language
- Support decisions with AI systems, with human control

**Optional inline link:** "Learn more about the Enterprise AI Platform" linking to `/enterprise-ai`.

---

## Section 7: Data Intelligence That Supports Decisions

**Heading:** Data Intelligence That Supports Decisions

**Body:**

Most enterprises have data spread across multiple systems. Without structure, it slows decision-making.

Artisans Cloud brings data together so teams can act on what is happening now, not what happened earlier.

**Bullets:**
- Unified data across systems
- Real-time visibility into operations
- Support for planning, forecasting, and reporting

**Optional inline link:** "Learn more about Data Intelligence" linking to `/data-intelligence`.

---

## Section 8: Built for Real-World Enterprise Environments

**Heading:** Built for Real-World Enterprise Environments

**Body:** Designed for organizations operating across:

**Industries (rendered as inline tags or a horizontal strip):**
- Retail
- Automotive
- Manufacturing

**Body continued:** Supporting:

**Capabilities (rendered as inline tags or a small grid):**
- Multi-location operations
- Distributed teams
- High transaction volumes

---

## Section 9: How This Helps

**Heading:** How This Helps

**Bullets:**
- Improve visibility across operations
- Enable faster and more reliable decisions
- Reduce delays between insight and execution
- Improve coordination across systems and teams

---

## Section 10: Strategic Impact Snapshot (preserved from existing)

Keep the existing Strategic Impact Snapshot section as-is. It includes:

**Heading:** Strategic Impact Snapshot
**Subhead:** Transformation, Quantified.
**Body:** Our platform and services are engineered for performance, scalability, and verifiable return on investment. We empower clients to drive enterprise agility, hyper-optimize operational efficiency, and accelerate sustainable growth. Every engagement is engineered for measurable return on intelligence.

**Metrics (existing four):**
- **40%** Acceleration in strategic reporting via unified Decision Intelligence frameworks
- **25%** Margin Expansion through predictive pricing and logistics optimization
- **Significant cost avoidance** achieved through AI-driven cognitive automation
- **Cross-enterprise data unification** enabling faster, evidence-based action

The numbers and framing already align with the new positioning. No rewrite needed for this section.

---

## Section 11: Closing CTA

**Heading:** Explore the Right System for Your Business

**Body:** Whether you are building a unified commerce platform, deploying enterprise AI, or strengthening your data foundation, Artisans Cloud provides the systems to support your next phase of growth.

**CTA:** **Request a Demo** (links to `/request-demo` once it exists; until Step 3 ships, link to `/contact-us`)

---

## Section 12: Insights and Leadership (preserved from existing)

Keep the existing Insights and Leadership section. It auto-loads blog article cards via `assets/script/modules/blog-articles.js` and the empty `#insights-grid` container. No content change needed.

---

## Sections to drop from the existing homepage

Replaced or rendered redundant by the new structure. Remove during implementation.

- **The Partner for Intelligent Enterprise Transformation** (the "three strengths" section: Predictive Intelligence, Sector Expertise, Execution at Scale). Replaced by Sections 8 (industries) and 9 (outcomes).
- **Drive Sales, Reduce Costs, and Minimize Waste** CTA section (retail-narrow). Replaced by Section 11.

---

## Final section order on the page

1. Header partial
2. Hero (Section 1)
3. Our Clients and Partners (Section 2)
4. What We Offer + three Platform cards (Sections 3 and 4)
5. Unified Commerce for Retail Operations (Section 5)
6. AI for Enterprise Workflows (Section 6)
7. Data Intelligence That Supports Decisions (Section 7)
8. Built for Real-World Enterprise Environments (Section 8)
9. How This Helps (Section 9)
10. Strategic Impact Snapshot (Section 10, existing)
11. Closing CTA (Section 11)
12. Insights and Leadership (Section 12, existing)
13. Footer partial

---

## Implementation notes for Step 5

Visual assets:
- Hero floating cards: replace assets to match the four labels (Unified Commerce, Enterprise AI, Data Intelligence, Predictive Operations).
- Optional: source one supporting image per Platform card if the existing `ourCore-*.webp` assets are not appropriate.

Schema markup to add:
- `Organization` JSON-LD with `hasOfferCatalog` listing the three Platforms.

CTA destinations:
- Hero "Request a Demo" → `/contact-us` (interim) until Step 3 ships `/request-demo`.
- Hero "Explore Platforms" → anchor link `#platforms`.
- Three Platform card CTAs → `/unified-commerce`, `/enterprise-ai`, `/data-intelligence`.
- Closing "Request a Demo" → same as hero (interim `/contact-us`, switch to `/request-demo` later).

Step 3 should include an audit pass that switches all "Request a Demo" link destinations across the site to the new page in one go.

Cleanup tasks (carried from the Step 5 task list in the roadmap):
- Remove the `meta name="keywords"` tag (Google has ignored it for over a decade and it tips targeting to competitors).
- Replace the hyphen-as-dash on the Core Verticals description ("foundation - designed to deliver") if that section is being dropped. If kept, fix the hyphen.

Brand naming:
- This draft uses "Artisans Cloud" consistently per the resolved brand decision. No legacy "Artisans Commerce Cloud" or bare "Artisans" references.

Writing-rule fixes already applied compared to the source `~/Downloads/Home Page.docx`:
- Em dash in the Enterprise AI Platform card ("real-world use—supporting") replaced with phrasing that does not need a dash ("built for production workflows, supporting").
- Five `👉` emojis removed.
- Smart apostrophe in the closing CTA ("you’re") replaced with "you are" to avoid the curly-quote issue entirely.
- "real-world" repetition reduced (Enterprise AI Platform card now reads "production workflows" instead).
- "What We Offer" redundancy trimmed: the "When combined ..." sentence merged into the existing paragraph.
- Closing CTA wording made consistent with Platform names ("deploying enterprise AI" rather than "developing enterprise AI workflows").
