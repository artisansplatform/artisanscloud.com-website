# Artisans Cloud Website - AI Coding Instructions

## Project Overview
A static website built for **Artisans Cloud** (enterprise intelligence platform) showcasing:
- **Marketing pages** (index, about-us, blog)
- **Product solutions** (Retail Platform, Data Intelligence, Enterprise AI)
- **Solution sub-pages** (D2C eCommerce, Distributed Order Management, Customer Experience Management)

**Tech Stack**: Vanilla HTML/JS + Tailwind CSS v4 + Swiper.js, deployed on Vercel

---

## Architecture Patterns

### Page Structure
All HTML pages follow identical boilerplate:
1. **Fixed header** (`#siteHeader`) - sticky navigation with dropdown menus, mobile toggle
2. **Main content** - page-specific sections
3. **External scripts** (Lenis smoothing, Swiper carousels, analytics)
4. **Footer** (common across pages)

**Key files**: `index.html`, `retail-platform.html`, `data-intelligence.html`, `enterprise-ai.html` + solution/blog pages

### Styling Architecture
- **Tailwind CSS v4** ([tailwind.config.js](tailwind.config.js)) - no custom theme extensions yet
- **Input/Output CSS**: [assets/style/input.css](assets/style/input.css) → [assets/style/output.css](assets/style/output.css)
- **Naming**: CSS classes use Tailwind conventions + custom utilities (`.ripple`, `.dropdown-toggle`, `.dropdown-menu`)
- **Colors**: `text-heading`, `text-primary`, `bg-primary`, `light-sky` (defined in Tailwind config)

### JavaScript Patterns
**File**: [assets/script/main.js](assets/script/main.js) (629 lines, DOMContentLoaded-based)

**Modules** (DOM-ready sections):
- **Header behavior**: Scroll detection, class toggling (`header-scrolled`)
- **Dropdown menus**: `.tw-dropdown` + `.dropdown-toggle` + `.dropdown-menu` with click-outside closing
- **Mobile nav**: Menu toggle with overlay (uses `translate-x-full`, `overflow-hidden` states)
- **Button ripple**: Click animation on `.btn` elements
- **Swiper sliders**: Multiple instances (`.keyCapabilitySlider`, `.ModulesBusinessImpactSlider`, `.useCasesSlider`, etc.)
- **Lenis smooth scroll**: Auto-initialized if library available

---

## Critical Development Patterns

### Navigation & Routing
- **Clean URLs**: Vercel config sets `"cleanUrls": true` → pages accessible without `.html`
- **Links**: Use root-relative paths: `/index`, `/retail-platform`, `/data-intelligence`
- **Active states**: Pages mark their nav link with `.active` class (manual per page)

### Component Reuse
- **Header/Footer**: Identical across all pages (copy-paste pattern, NOT extracted)
- **Dropdown system**: Reusable `.tw-dropdown` wrapper with JavaScript event delegation
- **Swiper instances**: Each slider on a page gets unique naming (e.g., `keyCapabilitySlider`, `ModulesBusinessImpactSlider`)

### Accessibility & Interactions
- **Mobile breakpoint**: `lg:` breakpoint (1024px) controls desktop/mobile layout
- **Touch considerations**: Swiper sliders use `allowTouchMove: true` + `freeMode`
- **ARIA labels**: Minimal use - add `aria-label` to buttons like `#menuToggle`
- **Keyboard support**: Escape key closes dropdowns and mobile menu

---

## Build & Deployment Workflow

### Local Development
```bash
npm run dev
# Starts Vite dev server at http://localhost:3000/ with auto-reload
# Runs in parallel:
#   - Vite dev server (watches HTML/JS files, auto-reloads browser)
#   - Tailwind CSS watch (compiles assets/style/input.css → assets/style/output.css)
# All changes trigger automatic browser reload—no manual refresh needed
```

**Auto-reload setup**: The dev server uses Vite for instant hot reload + Tailwind watch for CSS compilation. When working on tasks, always run `npm run dev` to see changes live in the browser at http://localhost:3000/.

Make sure to check how the respective pages look in the browser after making the changes.

### Deployment
- **Platform**: Vercel
- **Config**: [vercel.json](vercel.json) (minimal, just cleanUrls)
- **No build step**: Static files served as-is (CSS pre-compiled)
- **Branches**: Main branch auto-deploys

---

## When Modifying Pages

### Adding New Solution Page
1. **Create HTML** (e.g., `new-solution.html`)
2. **Copy header/footer** from existing page
3. **Update nav links**: Manually add `/new-solution` link in ALL pages' header nav
4. **Mark active state**: Add `.active` class to the new page's nav link
5. **Import Swiper/Lenis**: Include `<script src="...swiper..."></script>` + `<link href="...swiper.css">`
6. **Compile CSS**: Run `npm run dev` to generate output.css

### Adding Swiper Slider
1. **HTML structure**: Use `.swiper`, `.swiper-wrapper`, `.swiper-slide`, navigation buttons
2. **JavaScript**: Add config in [assets/script/main.js](assets/script/main.js) (inside DOMContentLoaded)
   - Unique class selector (e.g., `.newSliderName`)
   - Breakpoint config for responsive columns
   - Navigation selectors: `.swiper-button-next-newSliderName`, `.swiper-button-prev-newSliderName`
3. **CSS**: Swiper CSS already imported globally

### Fixing Header Across Multiple Pages
- Header is duplicated in each `.html` file—**changes must be applied to ALL pages**
- Consider: future refactor to use server-side includes or JavaScript injection

---

## Common Conventions

| Convention | Pattern |
|-----------|---------|
| **Button styling** | `.py-3 .px-5 .rounded-[40px] .bg-heading .text-white` (primary CTA) |
| **Spacing utility** | `gap-` prefix for flexbox gaps; margin/padding as `m-`/`p-` |
| **Breakpoints** | `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px) |
| **Animation** | `.transition-all .duration-300 .ease-in-out` (standard); `.translate-x-full` for slides |
| **Menu items** | `.dropdown-item` class on links inside `.dropdown-menu` |
| **Swiper config** | `slidesPerView: 1` (mobile), scaling up at breakpoints |

---

## Quick Debugging Tips

- **Dropdown not showing**: Check `.show` class is being toggled + z-index layers
- **Swiper not rendering**: Verify Swiper CDN link loaded + new slider instance created in JS
- **Styles not applying**: Run `npm run dev` to rebuild `output.css`
- **Mobile nav stuck**: Check `overflow-hidden` class on `document.body`, verify overlay click handlers
- **Header sticking on scroll**: Verify `.header-scrolled` toggling in scroll event listener

---

## When to Escalate

- **SEO/meta changes**: Update Open Graph meta tags in every HTML page
- **Logo/color changes**: Update [tailwind.config.js](tailwind.config.js) + regenerate CSS
- **Large refactors**: Consider extracting shared header/footer to reduce duplication
