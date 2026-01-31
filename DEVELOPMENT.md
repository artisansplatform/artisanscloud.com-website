# Development Guide

## Architecture Overview

The website now uses a **component-based architecture** with shared header and footer components. This means:

- **Header and footer are defined once** in the `partials/` directory
- **All HTML pages reference these partials** using Handlebars syntax
- **Changes to header/footer automatically apply to all pages**

## Directory Structure

```
├── partials/               # Shared HTML components
│   ├── header.html        # Site header (navigation, logo, mobile menu)
│   └── footer.html        # Site footer (links, contact info, copyright)
├── *.html                 # Page templates (contain {{> header}} and {{> footer}})
├── assets/                # Static assets (CSS, JS, images)
├── vite.config.js         # Build configuration
└── package.json           # Scripts and dependencies
```

## Development Workflow

### Starting the Dev Server

```bash
npm run dev
```

This command:
- Starts the Vite dev server at http://localhost:3000
- Watches for changes and auto-reloads the browser
- Compiles Tailwind CSS
- Processes Handlebars partials in real-time

### Making Changes

#### Updating Header or Footer

1. Edit the respective file in `partials/`:
   - `partials/header.html` for navigation, logo, etc.
   - `partials/footer.html` for footer content
2. Save the file
3. All pages will automatically update (hot reload)

**Example**: To add a new navigation link, edit `partials/header.html`:

```html
<a href="/new-page" class="header-link...">New Page</a>
```

This change will appear on ALL pages immediately.

#### Creating a New Page

1. Create a new HTML file (e.g., `new-page.html`)
2. Use this template structure:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    
    <title>Your Page Title | Artisans Cloud</title>
    
    <!-- Font Family -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:..." rel="stylesheet">
    
    <!-- swiper css -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <link rel="stylesheet" href="./assets/style/output.css">
</head>
<body>
    <div id="cursor" class="hidden lg:block fixed z-[1] w-36 h-36 rounded-full bg-primary blur-3xl pointer-events-none opacity-0"></div>
    
    {{> header}}
    
    <!----- Your Page Content ----->
    <main>
        <!-- Your content here -->
    </main>
    <!----- End Your Page Content ----->
    
    {{> footer}}
    
    <!--+++++++ Script Start +++++++-->
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollTrigger.min.js"></script>
    <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
    <script src='assets/script/main.js'></script>
</body>
</html>
```

3. The `{{> header}}` and `{{> footer}}` placeholders will be replaced with the actual components
4. Save and view at http://localhost:3000/new-page

## Building for Production

```bash
npm run build
```

This command:
- Compiles Tailwind CSS (minified)
- Processes all HTML files with Handlebars partials
- Outputs production-ready files to `dist/` directory
- Optimizes assets and images

The `dist/` directory contains the final built website ready for deployment.

## Deployment (Vercel)

The site is configured to deploy on Vercel with:
- **Build command**: `npm run build` (automatically detected)
- **Output directory**: `dist`
- **Clean URLs**: Enabled (pages accessible without `.html` extension)

When you push changes to the repository, Vercel will:
1. Run `npm install`
2. Run `npm run build`
3. Deploy the `dist/` directory
4. Make the site available at your domain

## Technical Details

### Handlebars Partials

The site uses [vite-plugin-handlebars](https://www.npmjs.com/package/vite-plugin-handlebars) to process HTML templates.

**Syntax**:
- `{{> header}}` - Includes `partials/header.html`
- `{{> footer}}` - Includes `partials/footer.html`

During build/dev, these placeholders are replaced with the actual HTML content.

### Why This Approach?

**Before**: Duplicate header/footer in every HTML file
- ❌ Updating navigation required editing 15+ files
- ❌ Easy to miss files or introduce inconsistencies
- ❌ Difficult to maintain

**After**: Single source of truth for shared components
- ✅ Edit once, update everywhere
- ✅ Guaranteed consistency across all pages
- ✅ Easy to maintain and scale
- ✅ No framework overhead - still generates static HTML

## Troubleshooting

### Dev server not updating after changes
- Restart the dev server: `Ctrl+C` then `npm run dev`

### Build fails
- Check that all HTML files have matching `{{> header}}` and `{{> footer}}` placeholders
- Ensure `partials/header.html` and `partials/footer.html` exist

### Page not found in dev
- Make sure the HTML file is in the root directory
- Access pages without `.html` extension (e.g., `/about-us` not `/about-us.html`)

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

## Next Steps

- Add more partials as needed (e.g., `partials/navigation.html`, `partials/cta.html`)
- Consider adding page-specific data injection via Handlebars context
- Explore using Handlebars helpers for dynamic content
