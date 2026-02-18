import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getHtmlFiles() {
  return fs.readdirSync(rootDir).filter((file) => file.endsWith('.html'));
}

function stripHashAndQuery(value) {
  return value.split('#')[0].split('?')[0].trim();
}

function isExternalOrIgnored(rawRef) {
  if (!rawRef) return true;

  const ref = rawRef.trim();
  if (!ref || ref === '#') return true;

  return (
    ref.startsWith('//') ||
    ref.startsWith('mailto:') ||
    ref.startsWith('tel:') ||
    ref.startsWith('javascript:') ||
    ref.startsWith('data:') ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(ref)
  );
}

function resolveInternalPath(ref, sourceFilePath) {
  const cleanRef = stripHashAndQuery(ref);
  if (!cleanRef) return null;

  const resolved = cleanRef.startsWith('/')
    ? path.resolve(rootDir, `.${cleanRef}`)
    : path.resolve(path.dirname(sourceFilePath), cleanRef);

  const relativeToRoot = path.relative(rootDir, resolved);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return resolved;
}

function pageHrefToPath(href, sourceFilePath) {
  const cleanHref = stripHashAndQuery(href);
  if (!cleanHref) return null;

  // Root route maps to index page
  if (cleanHref === '/') {
    return path.join(rootDir, 'index.html');
  }

  const hasKnownFileExtension = /\.[a-zA-Z\d]+$/.test(cleanHref);
  if (hasKnownFileExtension && !cleanHref.endsWith('.html')) {
    return null;
  }

  let candidate = cleanHref;

  // Clean URL support: /about-us => /about-us.html
  if (!candidate.endsWith('.html')) {
    candidate = `${candidate}.html`;
  }

  return resolveInternalPath(candidate, sourceFilePath);
}

describe('Link Validation Tests', () => {
  it('should validate internal page links (root-relative and relative) point to existing HTML files', () => {
    const htmlFiles = getHtmlFiles();
    expect(htmlFiles.length).toBeGreaterThan(0);

    const brokenLinks = [];

    htmlFiles.forEach((htmlFile) => {
      const sourceFilePath = path.join(rootDir, htmlFile);
      const content = fs.readFileSync(sourceFilePath, 'utf-8');
      const dom = new JSDOM(content);
      const document = dom.window.document;

      const links = document.querySelectorAll('a[href]');

      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || isExternalOrIgnored(href)) return;

        const targetPath = pageHrefToPath(href, sourceFilePath);
        if (!targetPath) return;

        if (!fs.existsSync(targetPath)) {
          brokenLinks.push({
            sourceFile: htmlFile,
            href,
            expectedFile: path.relative(rootDir, targetPath),
          });
        }
      });
    });

    if (brokenLinks.length > 0) {
      const errorMessage = brokenLinks
        .map(
          (link) =>
            `  - ${link.sourceFile}: href="${link.href}" -> expected file "${link.expectedFile}" not found`
        )
        .join('\n');

      throw new Error(`Found ${brokenLinks.length} broken internal page link(s):\n${errorMessage}`);
    }

    expect(brokenLinks).toEqual([]);
  });

  it('should validate local static resources exist for src/href attributes', () => {
    const htmlFiles = getHtmlFiles();
    const missingResources = [];

    const selectors = [
      'script[src]',
      'img[src]',
      'source[src]',
      'video[src]',
      'audio[src]',
      'link[href]',
    ];

    htmlFiles.forEach((htmlFile) => {
      const sourceFilePath = path.join(rootDir, htmlFile);
      const content = fs.readFileSync(sourceFilePath, 'utf-8');
      const dom = new JSDOM(content);
      const document = dom.window.document;

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          const attributeName = selector.includes('[src]') ? 'src' : 'href';
          const ref = node.getAttribute(attributeName);

          if (!ref || isExternalOrIgnored(ref)) return;

          // Ignore route links in <link> tags that are not static assets.
          if (attributeName === 'href' && !/\.[a-zA-Z\d]+($|\?|#)/.test(ref)) return;

          const resolvedPath = resolveInternalPath(ref, sourceFilePath);
          if (!resolvedPath) return;

          if (!fs.existsSync(resolvedPath)) {
            missingResources.push({
              sourceFile: htmlFile,
              ref,
              expectedFile: path.relative(rootDir, resolvedPath),
            });
          }
        });
      });
    });

    if (missingResources.length > 0) {
      const errorMessage = missingResources
        .map(
          (item) =>
            `  - ${item.sourceFile}: resource="${item.ref}" -> expected file "${item.expectedFile}" not found`
        )
        .join('\n');

      throw new Error(`Found ${missingResources.length} missing local resource(s):\n${errorMessage}`);
    }

    expect(missingResources).toEqual([]);
  });
});
