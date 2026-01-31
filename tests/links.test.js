import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Link Validation Tests', () => {
  it('should validate all internal links point to existing pages', () => {
    // Get all HTML files in the root directory
    const files = fs.readdirSync(rootDir);
    const htmlFiles = files.filter((file) => file.endsWith('.html'));

    expect(htmlFiles.length).toBeGreaterThan(0);

    const brokenLinks = [];

    htmlFiles.forEach((htmlFile) => {
      const filePath = path.join(rootDir, htmlFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Parse HTML
      const dom = new JSDOM(content);
      const document = dom.window.document;

      // Find all links
      const links = document.querySelectorAll('a[href]');

      links.forEach((link) => {
        const href = link.getAttribute('href');

        // Check if it's an internal link (starts with /)
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          // Remove leading slash and any hash/query params
          let targetPage = href.substring(1).split('#')[0].split('?')[0];

          // If empty after removing slash, it's the index page
          if (targetPage === '') {
            targetPage = 'index';
          }

          // Add .html extension if not present
          if (!targetPage.endsWith('.html')) {
            targetPage += '.html';
          }

          const targetPath = path.join(rootDir, targetPage);

          // Check if the target file exists
          if (!fs.existsSync(targetPath)) {
            brokenLinks.push({
              sourceFile: htmlFile,
              href: href,
              expectedFile: targetPage,
            });
          }
        }
      });
    });

    // Report broken links if any
    if (brokenLinks.length > 0) {
      const errorMessage = brokenLinks
        .map(
          (link) =>
            `  - ${link.sourceFile}: href="${link.href}" -> expected file "${link.expectedFile}" not found`
        )
        .join('\n');

      throw new Error(`Found ${brokenLinks.length} broken internal link(s):\n${errorMessage}`);
    }

    expect(brokenLinks).toEqual([]);
  });

  it('should find internal links in HTML files', () => {
    // This test ensures we're actually finding links to validate
    const files = fs.readdirSync(rootDir);
    const htmlFiles = files.filter((file) => file.endsWith('.html'));

    let totalInternalLinks = 0;

    htmlFiles.forEach((htmlFile) => {
      const filePath = path.join(rootDir, htmlFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      const dom = new JSDOM(content);
      const document = dom.window.document;
      const links = document.querySelectorAll('a[href]');

      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          totalInternalLinks++;
        }
      });
    });

    // We should have at least some internal links
    expect(totalInternalLinks).toBeGreaterThan(0);
  });
});
