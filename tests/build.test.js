import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Dynamically get all HTML pages from the root directory
// This ensures tests automatically discover new pages without manual updates.
// Note: This matches the behavior of vite.config.js (line 8) which also uses
// glob.sync('*.html') to build all HTML files in the root directory.
// Any HTML file in the root will be built and tested - this is intentional.
const expectedPages = glob.sync('*.html', { cwd: rootDir });

describe('Build Verification Tests', () => {
  beforeAll(() => {
    // Ensure tests are run after build
    if (!fs.existsSync(distDir)) {
      throw new Error(
        'dist directory does not exist. Please run "npm run build" before running tests.'
      );
    }
  });

  it('should create dist directory', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  describe('HTML Pages', () => {
    it('should build all expected HTML pages', () => {
      const missingPages = [];

      expectedPages.forEach((page) => {
        const pagePath = path.join(distDir, page);
        if (!fs.existsSync(pagePath)) {
          missingPages.push(page);
        }
      });

      expect(missingPages).toEqual([]);
    });

    it('should process Handlebars partials (no {{> header}} or {{> footer}} syntax)', () => {
      const pagesWithUnprocessedPartials = [];

      expectedPages.forEach((page) => {
        const pagePath = path.join(distDir, page);
        if (fs.existsSync(pagePath)) {
          const content = fs.readFileSync(pagePath, 'utf-8');

          // Check for unprocessed Handlebars partial syntax
          if (content.includes('{{> header}}') || content.includes('{{> footer}}')) {
            pagesWithUnprocessedPartials.push(page);
          }
        }
      });

      expect(pagesWithUnprocessedPartials).toEqual([]);
    });

    it('should contain actual <header> and <footer> HTML elements', () => {
      const pagesWithoutElements = [];

      // The 404 page doesn't have header/footer by design, so we skip it
      const pagesToCheck = expectedPages.filter(page => page !== '404.html');

      pagesToCheck.forEach((page) => {
        const pagePath = path.join(distDir, page);
        if (fs.existsSync(pagePath)) {
          const content = fs.readFileSync(pagePath, 'utf-8');

          // Check for actual header and footer HTML elements
          const hasHeader = content.includes('<header');
          const hasFooter = content.includes('<footer');

          if (!hasHeader || !hasFooter) {
            pagesWithoutElements.push({
              page,
              hasHeader,
              hasFooter,
            });
          }
        }
      });

      expect(pagesWithoutElements).toEqual([]);
    });
  });

  describe('Dynamic Blog Containers', () => {
    it('should have #blog-grid container in articles-and-resources.html', () => {
      const pagePath = path.join(distDir, 'articles-and-resources.html');
      expect(fs.existsSync(pagePath)).toBe(true);
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toMatch(/id=.blog-grid./);
    });

    it('should have #insights-grid container in index.html', () => {
      const pagePath = path.join(distDir, 'index.html');
      expect(fs.existsSync(pagePath)).toBe(true);
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toMatch(/id=.insights-grid./);
    });
  });

  describe('CSS Generation', () => {
    it('should generate CSS file in dist/assets', () => {
      const assetsDir = path.join(distDir, 'assets');
      expect(fs.existsSync(assetsDir)).toBe(true);

      // Find CSS files (Vite generates hashed filenames)
      const files = fs.readdirSync(assetsDir);
      const cssFiles = files.filter((file) => file.endsWith('.css'));

      expect(cssFiles.length).toBeGreaterThan(0);
    });

    it('should have CSS file with content', () => {
      const assetsDir = path.join(distDir, 'assets');
      const files = fs.readdirSync(assetsDir);
      const cssFiles = files.filter((file) => file.endsWith('.css'));

      expect(cssFiles.length).toBeGreaterThan(0);

      // Check that at least one CSS file has content
      const cssFile = cssFiles[0];
      const cssPath = path.join(assetsDir, cssFile);
      const content = fs.readFileSync(cssPath, 'utf-8');

      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Sitemap', () => {
    it('should generate sitemap.xml in dist/', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });

    it('sitemap.xml should be valid XML with urlset root element', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(content).toContain('</urlset>');
    });

    it('sitemap.xml should contain the homepage URL', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('<loc>https://www.artisanscloud.com/</loc>');
    });

    it('sitemap.xml should contain at least one non-homepage URL', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('<loc>https://www.artisanscloud.com/retail-platform</loc>');
    });

    it('sitemap.xml should not contain excluded pages', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).not.toContain('/404');
      expect(content).not.toContain('/thank-you');
      expect(content).not.toContain('/blog-detail');
    });

    it('sitemap.xml should not contain .html extensions in URLs', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      // URLs inside <loc> tags should not end in .html (Vercel cleanUrls)
      expect(content).not.toMatch(/<loc>[^<]+\.html<\/loc>/);
    });

    it('sitemap.xml should contain a lastmod date in YYYY-MM-DD format', () => {
      const sitemapPath = path.join(distDir, 'sitemap.xml');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    });

    it('robots.txt should exist in dist/', () => {
      const robotsPath = path.join(distDir, 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
    });

    it('robots.txt should reference the sitemap', () => {
      const robotsPath = path.join(distDir, 'robots.txt');
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('Sitemap: https://www.artisanscloud.com/sitemap.xml');
    });
  });

  describe('JS Generation', () => {
    it('should generate hashed JS file in dist/assets', () => {
      const assetsDir = path.join(distDir, 'assets');
      expect(fs.existsSync(assetsDir)).toBe(true);

      // Vite outputs content-hashed filenames like main.a1b2c3d4.js
      const files = fs.readdirSync(assetsDir);
      const jsFiles = files.filter((file) => file.endsWith('.js'));

      expect(jsFiles.length).toBeGreaterThan(0);
    });

    it('should have hashed JS file for main entry', () => {
      const assetsDir = path.join(distDir, 'assets');
      const files = fs.readdirSync(assetsDir);
      // main.[hash].js - filename contains "main" and a hash segment
      const mainJsFiles = files.filter((file) => /^main\.[A-Za-z0-9_-]+\.js$/.test(file));

      expect(mainJsFiles.length).toBeGreaterThan(0);
    });

    it('should not contain unhashed main.js at old script path', () => {
      const oldPath = path.join(distDir, 'assets', 'script', 'main.js');
      expect(fs.existsSync(oldPath)).toBe(false);
    });
  });
});
