import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function findMarkdown() {
  const out = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "*.md"],
    { cwd: rootDir, encoding: "utf-8" },
  );
  return out.split("\0").filter(Boolean);
}

// Blank out fenced code blocks instead of removing them, so line numbers in
// failure messages still point at the real line in the file.
function stripFences(lines) {
  const out = [];
  let fence = null;
  for (const line of lines) {
    const m = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      out.push("");
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length)
        fence = null;
      continue;
    }
    if (m) {
      fence = m[1];
      out.push("");
      continue;
    }
    out.push(line);
  }
  return out;
}

const SEPARATOR = /^\|(\s*:?-+:?\s*\|)+$/;

function tableProblems(text) {
  const lines = stripFences(text.split("\n"));
  const problems = [];

  let start = -1;
  const flush = (end) => {
    if (start === -1) return;
    const run = lines.slice(start, end);
    if (run.length < 2) {
      problems.push(
        `line ${start + 1}: lone table row, join it to the table above (no blank line between rows)`,
      );
    } else if (!SEPARATOR.test(run[1].trim().replace(/\s+/g, " "))) {
      problems.push(
        `line ${start + 1}: table has no header separator row (| --- | ...)`,
      );
    }
    start = -1;
  };

  lines.forEach((line, i) => {
    if (line.trimStart().startsWith("|")) {
      if (start === -1) start = i;
    } else {
      flush(i);
    }
  });
  flush(lines.length);

  return problems;
}

// ---------------------------------------------------------------------------
// Markdown tables must render. A row separated from its table by a blank line,
// or a table with no header separator, renders as plain text and nothing else
// catches it (PR #113 shipped exactly that).
// ---------------------------------------------------------------------------
describe("Markdown tables render", () => {
  const files = findMarkdown();

  it("finds markdown files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s", (file) => {
    const text = fs.readFileSync(path.join(rootDir, file), "utf-8");
    expect(tableProblems(text), `${file} has broken markdown tables`).toEqual(
      [],
    );
  });
});
