import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Expected HTML pages that should be built
const expectedPages = [
  'index.html',
  'about-us.html',
  'blog-detail.html',
  'blog-list.html',
  'browser-pos.html',
  'contact-us.html',
  'customer-experience-management.html',
  'd2c-eCommerce.html',
  'data-intelligence.html',
  'distributed-order-management.html',
  'enterprise-ai.html',
  'overview.html',
  'page-404.html',
  'retail-platform.html',
  'thank-you.html',
];

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
      const pagesToCheck = expectedPages.filter(page => page !== 'page-404.html');

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
});
