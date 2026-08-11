import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import path from "path";
import fs from "fs";
import { loadPages, headContext } from "./scripts/lib/page-meta.js";
import { allPages } from "./scripts/lib/site-files.js";

// Load vercel.json redirects for local simulation
const vercelConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "vercel.json"), "utf-8"),
);
const devRedirects = vercelConfig.redirects || [];

function devRoutingPlugin() {
  return {
    name: "dev-routing",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(
          req.url,
          `http://${req.headers.host || "localhost"}`,
        );
        const pathname = url.pathname;

        // 1. Simulate vercel.json redirects
        const redirect = devRedirects.find(
          (r) =>
            r.source === pathname || r.source === pathname.replace(/\/$/, ""),
        );
        if (redirect) {
          res.writeHead(301, { Location: redirect.destination });
          res.end();
          return;
        }

        // 2. Clean URLs: rewrite /path to /path.html if on disk
        if (
          !pathname.endsWith(".html") &&
          pathname !== "/" &&
          !pathname.includes(".")
        ) {
          const relativeHtmlPath = pathname.substring(1) + ".html";
          const absoluteHtmlPath = path.resolve(__dirname, relativeHtmlPath);
          if (fs.existsSync(absoluteHtmlPath)) {
            req.url = pathname + ".html" + url.search;
          }
        }

        next();
      });
    },
  };
}

// Every source page becomes a Rollup input. Discovery is recursive (see
// scripts/lib/site-files.js), so pages in a brand-new directory are built
// without touching this file.
const input = {};
allPages().forEach((file) => {
  const name = file.startsWith("team/")
    ? file.replace(".html", "").replace("/", "-")
    : file.replace(".html", "");
  input[name] = path.resolve(__dirname, file);
});

// Add main.js as an explicit Rollup entry so Vite bundles and hashes it
input["main"] = path.resolve(__dirname, "assets/script/main.js");

export default defineConfig({
  plugins: [
    devRoutingPlugin(),
    handlebars({
      partialDirectory: path.resolve(__dirname, "partials"),
      // Per-page template variables for the head-meta partial, looked up in
      // assets/data/pages.json by slug. Re-read on every transform so edits
      // to pages.json show up in dev without restarting the server.
      context: (pagePath) => {
        const slug = pagePath.replace(/^\//, "").replace(/\.html$/, "");
        const meta = loadPages()[slug];
        return meta ? headContext(slug, meta) : {};
      },
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input,
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
      },
    },
  },
  server: {
    port: 3000,
    open: true, // Automatically open browser
    watch: {
      usePolling: true, // Better compatibility for some file systems
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
  },
});
