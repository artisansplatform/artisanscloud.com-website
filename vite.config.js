import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import path from "path";
import fs from "fs";
import { glob } from "glob";
import { loadPages, headContext } from "./scripts/lib/page-meta.js";

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

// Get all HTML files in the root directory, team/ subdirectory, and other subdirectories
const htmlFiles = glob.sync("*.html", { cwd: __dirname });
const teamFiles = glob.sync("team/*.html", { cwd: __dirname });
const enterpriseCopilotFiles = glob.sync("enterprise-copilot/*.html", {
  cwd: __dirname,
});
const unifiedCommerceFiles = glob.sync("unified-commerce/*.html", {
  cwd: __dirname,
});
const rolePlayAgentFiles = glob.sync("role-play-agent/*.html", {
  cwd: __dirname,
});
const knowledgeHarvesterFiles = glob.sync("knowledge-harvester/*.html", {
  cwd: __dirname,
});

const input = {};
htmlFiles.forEach((file) => {
  const name = file.replace(".html", "");
  input[name] = path.resolve(__dirname, file);
});
teamFiles.forEach((file) => {
  const name = file.replace(".html", "").replace("/", "-");
  input[name] = path.resolve(__dirname, file);
});
enterpriseCopilotFiles.forEach((file) => {
  const name = file.replace(".html", "");
  input[name] = path.resolve(__dirname, file);
});
unifiedCommerceFiles.forEach((file) => {
  const name = file.replace(".html", "");
  input[name] = path.resolve(__dirname, file);
});
rolePlayAgentFiles.forEach((file) => {
  const name = file.replace(".html", "");
  input[name] = path.resolve(__dirname, file);
});
knowledgeHarvesterFiles.forEach((file) => {
  const name = file.replace(".html", "");
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
