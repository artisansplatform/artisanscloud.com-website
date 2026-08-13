// Documentation stays true.
//
// The #113 review cycle caught two kinds of silent doc rot only by luck: a
// markdown table split in half by a stray blank line, and references to
// files that no longer exist (or never did). Both are machine-checkable.

import { execFileSync } from "child_process";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DOC_FILES = [
  ...glob.sync("*.md", { cwd: rootDir }),
  ...glob.sync("docs/**/*.md", { cwd: rootDir }),
  ...glob.sync(".github/**/*.md", { cwd: rootDir }),
  ...glob.sync(".claude/**/*.md", { cwd: rootDir }),
  ...glob.sync(".agent/**/*.md", { cwd: rootDir }),
].sort();

// Files docs may reference before they exist, with the reason. The staleness
// check below fails once the file lands (or the reference is dropped), so an
// entry cannot outlive its purpose.
const PLANNED_FILES = {
  "docs/information-architecture.md":
    "deliverable of docs/seo-navigation-roadmap.md, phase 1",
};

function stripFencedBlocks(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, (block) =>
    // Preserve line count so reported line numbers stay correct.
    block.replace(/[^\n]+/g, ""),
  );
}

describe("markdown tables are intact", () => {
  // A lone |-row (or a table with no separator line) renders as plain text,
  // which is exactly how the guardrails table silently broke in #113.
  it.each(DOC_FILES)("%s", (file) => {
    const lines = stripFencedBlocks(
      fs.readFileSync(path.join(rootDir, file), "utf-8"),
    ).split("\n");

    const problems = [];
    let start = null;
    const flush = (end) => {
      if (start === null) return;
      const run = lines.slice(start, end);
      const separator = /^\s*\|?\s*:?-{3,}[\s:|-]*$/;
      if (run.length === 1) {
        problems.push(
          `line ${start + 1}: lone table row; join it to the table above (no blank line between rows)`,
        );
      } else if (!separator.test(run[1])) {
        problems.push(
          `line ${start + 1}: table has no header separator row (| --- | ...)`,
        );
      }
      start = null;
    };
    lines.forEach((line, i) => {
      if (/^\s*\|/.test(line)) {
        if (start === null) start = i;
      } else {
        flush(i);
      }
    });
    flush(lines.length);

    expect(problems, `${file}: broken markdown table(s)`).toEqual([]);
  });
});

describe("doc file references resolve", () => {
  // Inventory of tracked files, for suffix matching shorthand references
  // like `modules/card-toggle.js` (really assets/script/modules/...).
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: rootDir })
    .toString()
    .split("\0")
    .filter(Boolean);

  // Directory-qualified paths in inline code spans must exist. Bare
  // filenames, globs, and placeholder segments ([slug], {page}) are skipped:
  // they are usually examples, and checking them would mean an allowlist of
  // every illustration in the docs.
  function pathReferences(markdown) {
    const refs = [];
    for (const m of stripFencedBlocks(markdown).matchAll(/`([^`\s]+)`/g)) {
      const token = m[1].replace(/^\//, "");
      if (!token.includes("/")) continue;
      if (/[*{}[\]<>()$#@]/.test(token)) continue;
      if (token.includes("://")) continue;
      if (
        !/[\w-]\.(?:js|cjs|mjs|json|css|html|md|yml|yaml|sh|txt|png|svg|woff2|xml|vcf|csv)$/.test(
          token,
        )
      )
        continue;
      refs.push(token);
    }
    return refs;
  }

  it.each(DOC_FILES)("%s", (file) => {
    const refs = pathReferences(
      fs.readFileSync(path.join(rootDir, file), "utf-8"),
    );
    const broken = refs.filter(
      (ref) =>
        !(ref in PLANNED_FILES) &&
        !fs.existsSync(path.join(rootDir, ref)) &&
        !tracked.some((t) => t === ref || t.endsWith(`/${ref}`)),
    );
    expect(
      [...new Set(broken)],
      `${file} references files that do not exist. Fix the path, or add the ` +
        "entry to PLANNED_FILES in tests/docs.test.js if the file is a " +
        "documented future deliverable.",
    ).toEqual([]);
  });

  it("PLANNED_FILES entries are still pending and still referenced", () => {
    const allDocs = DOC_FILES.map((f) =>
      fs.readFileSync(path.join(rootDir, f), "utf-8"),
    ).join("\n");
    const stale = Object.keys(PLANNED_FILES).filter(
      (ref) => fs.existsSync(path.join(rootDir, ref)) || !allDocs.includes(ref),
    );
    expect(
      stale,
      "PLANNED_FILES entries that now exist (or are no longer referenced " +
        "anywhere). Remove them from tests/docs.test.js.",
    ).toEqual([]);
  });
});
