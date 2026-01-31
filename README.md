# Artisans Cloud Website

Static marketing website for **Artisans Cloud** - an enterprise intelligence platform offering retail solutions, data intelligence, and AI-powered business tools.

## 🚀 Tech Stack

- **HTML/CSS/JavaScript** - Vanilla implementation, no frameworks
- **Tailwind CSS v4** - Utility-first styling with custom configuration
- **Handlebars** - Template partials for shared components (header/footer)
- **Swiper.js** - Touch-enabled carousels and sliders
- **Lenis** - Smooth scroll library
- **Vite** - Development server with hot module reload and build tool
- **Vercel** - Deployment platform

## 📋 Prerequisites

- **Node.js** v18.19+ (required for Vite dev server)
- **npm** v9+ (package manager)

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

This command starts:
- **Vite dev server** at `http://localhost:3000/` (auto-reload on file changes)
- **Tailwind CSS watch** (compiles CSS automatically)

Your browser will open automatically. Any changes to HTML, JavaScript, or CSS files will trigger an instant page reload.

### 3. Build for Production

```bash
npm run build
```

This compiles:
- **Tailwind CSS** (minified) → `assets/style/output.css`
- **HTML templates** (with partials) → `dist/` directory

Output is ready for deployment in the `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

Starts a local server to preview the production build.

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server + Tailwind watch (parallel) |
| `npm run dev:tailwind` | Run Tailwind CSS watch only |
| `npm run dev:server` | Run Vite dev server only |
| `npm run build` | Build for production (CSS + HTML to `dist/`) |
| `npm run build:css` | Compile Tailwind CSS only |
| `npm run build:html` | Build HTML templates only |
| `npm run preview` | Preview production build locally |

## 🎨 Development Patterns

### Shared Components (NEW!)

The site now uses **Handlebars partials** for shared components:

- **Header**: `partials/header.html` (navigation, logo, mobile menu)
- **Footer**: `partials/footer.html` (links, contact info, copyright)

**Benefits**:
- ✅ Edit header/footer once, updates all pages automatically
- ✅ Guaranteed consistency across the site
- ✅ No framework overhead - still generates static HTML

**Usage in HTML files**:
```html
{{> header}}  <!-- Includes partials/header.html -->
<!-- Your page content -->
{{> footer}}  <!-- Includes partials/footer.html -->
```

For detailed instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Page Structure
All HTML pages follow a consistent structure:
1. **Head section** - Meta tags, title, stylesheets
2. **Header partial** - `{{> header}}` placeholder
3. **Main content** - Page-specific sections
4. **Footer partial** - `{{> footer}}` placeholder
5. **Scripts** - Lenis, Swiper, analytics

### Styling Conventions
- **Tailwind classes** for all styling (no custom CSS files)
- **Custom utilities**: `.ripple`, `.dropdown-toggle`, `.dropdown-menu`
- **Color scheme**: `text-heading`, `text-primary`, `bg-primary`, `light-sky`
- **Mobile breakpoint**: `lg:` (1024px) for desktop/mobile layouts

### JavaScript Architecture
- **Single file**: [assets/script/main.js](assets/script/main.js)
- **Event-driven**: All logic within `DOMContentLoaded`
- **Features**: Header scroll effects, dropdown menus, mobile nav, ripple effects, Swiper sliders

### Navigation
- **Clean URLs**: Pages accessible without `.html` extension
- **Root-relative paths**: Use `/index`, `/retail-platform`, etc.
- **Active states**: Manual `.active` class per page

## 🚢 Deployment

### Vercel (Production)

The site is automatically deployed to Vercel on every push to `main` branch.

**Build Process**:
1. Vercel runs `npm install`
2. Executes `npm run build` (compiles CSS and processes HTML)
3. Deploys the `dist/` directory

**Configuration**: [vercel.json](vercel.json)
- Build output directory: `dist`
- Clean URLs enabled (no `.html` extensions)

### Deployment Checklist
- [ ] Test locally: `npm run build && npm run preview`
- [ ] Verify all pages work correctly
- [ ] Check that header/footer changes appear on all pages
- [ ] Push to `main` branch
- [ ] Verify deployment on Vercel dashboard

## 🔧 Common Tasks

### Updating Header or Footer (NEW!)
1. Edit `partials/header.html` or `partials/footer.html`
2. Save - changes apply to ALL pages automatically
3. No need to update individual HTML files!

**Example**: Adding a new navigation link
```html
<!-- In partials/header.html -->
<a href="/new-page" class="header-link...">New Page</a>
```

### Adding a New Page
1. Create new `.html` file in root directory (e.g., `new-page.html`)
2. Use this structure:
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Head content -->
    <link rel="stylesheet" href="./assets/style/output.css">
</head>
<body>
    {{> header}}
    
    <!-- Your page content here -->
    
    {{> footer}}
    
    <!-- Scripts -->
</body>
</html>
```
3. The header and footer will be automatically included
4. Run `npm run dev` to test with auto-reload

For complete template example, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Adding a Swiper Slider
1. Add HTML structure (`.swiper`, `.swiper-wrapper`, `.swiper-slide`)
2. Update [assets/script/main.js](assets/script/main.js) with new slider config
3. Define unique class selector and breakpoint settings
4. Test responsiveness across breakpoints

### Updating Styles
1. Modify HTML classes (Tailwind utilities)
2. For new utilities, update [assets/style/input.css](assets/style/input.css)
3. For theme changes, edit [tailwind.config.js](tailwind.config.js)
4. Dev server auto-compiles and reloads

## 📝 Notes

- **Shared Components**: Header and footer are now managed via Handlebars partials in `partials/` directory
- **Build Output**: Production files are generated in `dist/` directory (not committed to git)
- **CSS Compilation**: Tailwind CSS is compiled during build process
- **External dependencies**: Swiper and Lenis loaded via CDN
- **Browser support**: Modern browsers (ES6+ required for JavaScript)
- **Template Engine**: Handlebars is only used at build time - final output is pure static HTML

## 🐛 Troubleshooting

**Styles not applying?**
- Check if dev server is running (`npm run dev`)
- Verify Tailwind classes are in `output.css`

**Dev server not reloading?**
- Clear browser cache
- Restart dev server (`Ctrl+C`, then `npm run dev`)

**Build fails?**
- Ensure Node.js v18.19+ is installed
- Delete `node_modules` and run `npm install`
- Check that `partials/header.html` and `partials/footer.html` exist

**Pages not loading correctly?**
- Verify all HTML files have `{{> header}}` and `{{> footer}}` placeholders
- Run `npm run build` to regenerate the `dist/` folder

## 📄 License

Proprietary - © Artisans Cloud

---

For detailed development guidelines, component architecture, and troubleshooting, see [DEVELOPMENT.md](DEVELOPMENT.md).

For AI coding instructions, see [.github/copilot-instructions.md](.github/copilot-instructions.md).
