#!/usr/bin/env node

/**
 * Minimal markdown-to-HTML converter for blog article bodies.
 *
 * Handles the subset of Markdown produced by Notion and hand-written articles:
 *   - Fenced code blocks (```lang ... ```)
 *   - Horizontal rules (---, ***, ___)
 *   - ATX headings (# through ######)
 *   - Blockquotes (> )
 *   - Unordered lists (-, *, +)
 *   - Ordered lists (1.)
 *   - Paragraphs (consecutive non-blank, non-block lines)
 *   - Inline: bold (**), italic (* and _), inline code (`), links, images, strikethrough (~~)
 *
 * Code blocks have HTML escaped. Other content is NOT escaped because the
 * Notion sync script controls the input and produces safe content.
 *
 * Export: markdownToHtml(markdown: string): string
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineToHtml(text) {
  // Images before links (![alt](url))
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return '<img src="' + src + '" alt="' + alt + '" loading="lazy">';
  });
  // Links ([text](url))
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return '<a href="' + href + '">' + label + '</a>';
  });
  // Bold (**text**)
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Strikethrough (~~text~~)
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Italic (*text* or _text_), but not inside words for _
  text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  text = text.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '<em>$1</em>');
  // Inline code (`code`)
  text = text.replace(/`([^`\n]+)`/g, (_, code) => {
    return '<code>' + escapeHtml(code) + '</code>';
  });
  return text;
}

/**
 * Convert a Markdown string to an HTML string.
 *
 * @param {string} markdown - Raw markdown text
 * @returns {string} HTML string
 */
export function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      const langAttr = lang ? ' class="language-' + lang + '"' : '';
      output.push('<pre><code' + langAttr + '>' + codeLines.join('\n') + '</code></pre>');
      continue;
    }

    // Horizontal rule (---, ***, ___)
    if (/^(---|\*\*\*|___)$/.test(line.trim())) {
      output.push('<hr>');
      i++;
      continue;
    }

    // ATX headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = inlineToHtml(headingMatch[2].trim());
      output.push('<h' + level + '>' + text + '</h' + level + '>');
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(inlineToHtml(lines[i].slice(2)));
        i++;
      }
      output.push('<blockquote><p>' + quoteLines.join('<br>') + '</p></blockquote>');
      continue;
    }

    // Unordered list
    if (/^[-*+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push('<li>' + inlineToHtml(lines[i].slice(2)) + '</li>');
        i++;
      }
      output.push('<ul>' + items.join('') + '</ul>');
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, '');
        items.push('<li>' + inlineToHtml(text) + '</li>');
        i++;
      }
      output.push('<ol>' + items.join('') + '</ol>');
      continue;
    }

    // Blank line (skip)
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-block lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6} /.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^> /.test(lines[i]) &&
      !/^[-*+] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^(---|\*\*\*|___)$/.test(lines[i].trim())
    ) {
      paraLines.push(inlineToHtml(lines[i]));
      i++;
    }
    if (paraLines.length > 0) {
      output.push('<p>' + paraLines.join(' ') + '</p>');
    }
  }

  return output.join('\n');
}
