# Artisans Cloud Website

Static marketing website for **Artisans Cloud** - an enterprise intelligence platform offering retail solutions, data intelligence, and AI-powered business tools.

## 🚀 Tech Stack

- **HTML/CSS/JavaScript** - Vanilla implementation, no frameworks
- **Tailwind CSS v4** - Utility-first styling with custom configuration
- **Swiper.js** - Touch-enabled carousels and sliders
- **Lenis** - Smooth scroll library
- **Vite** - Development server with hot module reload
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

Compiles and minifies Tailwind CSS for production deployment.

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
| `npm run build` | Compile Tailwind CSS for production |
| `npm run preview` | Preview production build locally |

## 🎨 Development Patterns

### Page Structure
All HTML pages follow a consistent structure:
1. **Fixed header** (`#siteHeader`) - Sticky navigation with dropdowns
2. **Main content** - Page-specific sections
3. **Footer** - Common footer across all pages
4. **External scripts** - Lenis, Swiper, analytics

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

**Configuration**: [vercel.json](vercel.json)
- Clean URLs enabled (no `.html` extensions)
- Static file serving (no build step required)

### Deployment Checklist
- [ ] Run `npm run build` to compile production CSS
- [ ] Test all pages locally with `npm run preview`
- [ ] Commit `assets/style/output.css` (generated CSS must be committed)
- [ ] Push to `main` branch
- [ ] Verify deployment on Vercel dashboard

## 🔧 Common Tasks

### Adding a New Page
1. Create new `.html` file in root directory
2. Copy header/footer from existing page
3. Update navigation links in **ALL** HTML files
4. Add `.active` class to new page's nav link
5. Run `npm run dev` to test with auto-reload

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

- **Header/Footer duplication**: Currently copy-pasted across all pages (consider future refactor)
- **CSS compilation**: `output.css` must be committed for Vercel deployment
- **External dependencies**: Swiper and Lenis loaded via CDN
- **Browser support**: Modern browsers (ES6+ required for JavaScript)

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

## 📄 License

Proprietary - © Artisans Cloud

---

For detailed development guidelines and AI coding instructions, see [.github/copilot-instructions.md](.github/copilot-instructions.md).
