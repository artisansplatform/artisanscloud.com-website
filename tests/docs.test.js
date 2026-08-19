import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function trackedMarkdown() {
  const out = execFileSync("git", ["ls-files", "-z", "*.md"], {
    cwd: rootDir,
    encoding: "utf-8",
  });
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

const SEPARATOR = /^\|(\s*:?-{3,}:?\s*\|)+$/;

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
  const files = trackedMarkdown();

  it("finds tracked markdown files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s", (file) => {
    const text = fs.readFileSync(path.join(rootDir, file), "utf-8");
    expect(tableProblems(text), `${file} has broken markdown tables`).toEqual(
      [],
    );
  });
});

// ---------------------------------------------------------------------------
// Documented file references resolve. Docs rot when a file gets renamed or
// deleted but a backticked path in a markdown doc still points at it
// (DEVELOPMENT.md once referenced `partials/navigation.html`, which never
// existed). Extract directory-qualified paths from inline code spans and
// check each one resolves against the working tree, a tracked git path, a
// gitignored path, or an explicit PLANNED_FILES exemption.
// ---------------------------------------------------------------------------

// Deliverables that documentation promises but that do not exist yet.
// Each entry must stay both absent from the repo and referenced by some doc,
// otherwise the staleness test below fails and the entry gets deleted.
const PLANNED_FILES = {
  "docs/information-architecture.md":
    "planned IA reference, see docs/seo-navigation-roadmap.md",
};

function trackedPaths() {
  const out = execFileSync("git", ["ls-files", "-z"], {
    cwd: rootDir,
    encoding: "utf-8",
  });
  return out.split("\0").filter(Boolean);
}

function buildTrackedSuffixIndex(paths) {
  const set = new Set(paths);
  return (candidate) => {
    if (set.has(candidate)) return true;
    const suffix = "/" + candidate;
    for (const p of paths) {
      if (p === candidate || p.endsWith(suffix)) return true;
    }
    return false;
  };
}

const MIME_PREFIXES = ["application/", "text/", "image/"];

function extractCandidates(file, text) {
  const lines = stripFences(text.split("\n"));
  const results = [];
  lines.forEach((line, i) => {
    const spanRe = /`([^`\n]+)`/g;
    let m;
    while ((m = spanRe.exec(line))) {
      let candidate = m[1];
      if (!candidate.includes("/")) continue;
      if (/\s/.test(candidate)) continue;
      if (/^\w+:/.test(candidate) || candidate.startsWith("//")) continue;
      if (candidate.startsWith("/")) continue;
      if (
        /[*{[<]/.test(candidate) ||
        candidate.includes("...") ||
        /(^|\/)[A-Z][A-Z0-9_-]*(\/|$)/.test(candidate)
      )
        continue;
      if (MIME_PREFIXES.some((p) => candidate.startsWith(p))) continue;
      if (candidate.startsWith("@")) continue;
      candidate = candidate.replace(/\/$/, "");
      if (!candidate) continue;
      results.push({ candidate, line: i + 1 });
    }
  });
  return results;
}

describe("Documented file references resolve", () => {
  const files = trackedMarkdown();
  const isTracked = buildTrackedSuffixIndex(trackedPaths());

  it.each(files)("%s", (file) => {
    const text = fs.readFileSync(path.join(rootDir, file), "utf-8");
    const candidates = extractCandidates(file, text);

    const unresolvedCandidates = candidates.filter(
      ({ candidate }) =>
        !fs.existsSync(path.join(rootDir, candidate)) &&
        !isTracked(candidate) &&
        !(candidate in PLANNED_FILES),
    );

    let ignored = new Set();
    if (unresolvedCandidates.length > 0) {
      const input = unresolvedCandidates.map((c) => c.candidate).join("\n");
      try {
        const out = execFileSync("git", ["check-ignore", "--stdin"], {
          cwd: rootDir,
          encoding: "utf-8",
          input,
        });
        ignored = new Set(out.split("\n").filter(Boolean));
      } catch (err) {
        // exit code 1 means none of the paths are ignored; stdout still
        // holds whichever ones matched before the non-match
        if (err.stdout)
          ignored = new Set(err.stdout.split("\n").filter(Boolean));
      }
    }

    const problems = unresolvedCandidates
      .filter(({ candidate }) => !ignored.has(candidate))
      .map(({ candidate, line }) => `line ${line}: ${candidate} (not found)`);

    expect(problems, `${file} has file references that do not resolve`).toEqual(
      [],
    );
  });
});

describe("PLANNED_FILES has no stale entries", () => {
  const files = trackedMarkdown();
  const fileTexts = files.map((file) => ({
    file,
    text: fs.readFileSync(path.join(rootDir, file), "utf-8"),
  }));

  it.each(Object.keys(PLANNED_FILES))("%s", (plannedPath) => {
    const existsOnDisk = fs.existsSync(path.join(rootDir, plannedPath));
    expect(
      existsOnDisk,
      `${plannedPath} now exists, remove it from PLANNED_FILES`,
    ).toBe(false);

    const referenced = fileTexts.some(({ text }) =>
      text.includes(`\`${plannedPath}\``),
    );
    expect(
      referenced,
      `${plannedPath} is no longer referenced by any tracked markdown file, remove it from PLANNED_FILES`,
    ).toBe(true);
  });
});
