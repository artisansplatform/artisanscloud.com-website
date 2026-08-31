import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { toPosix } from "./lib/paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// A Windows checkout with git's default core.autocrlf=true writes CRLF into
// the working tree. .prettierrc pins endOfLine to "lf", so without this rule
// the formatting gate fails on every text file the moment CI runs on Windows.
describe("Line ending normalization", () => {
  it("declares a repo-wide eol=lf rule", () => {
    const attributesPath = path.join(rootDir, ".gitattributes");
    expect(fs.existsSync(attributesPath)).toBe(true);
    const rules = fs
      .readFileSync(attributesPath, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    expect(rules).toContain("* text=auto eol=lf");
  });
});

describe("toPosix", () => {
  it("converts native separators to forward slashes", () => {
    expect(toPosix("assets\\script\\main.js")).toBe("assets/script/main.js");
  });

  it("leaves posix paths untouched", () => {
    expect(toPosix("assets/script/main.js")).toBe("assets/script/main.js");
  });
});

// Per the tests-over-prose policy: the Windows job only stays green if new
// glob call sites keep normalizing. This is the machine check for that.
//
// Both patterns are built by string concatenation so this file's own source
// does not match itself: a hardcoded self-exemption would leave the one file
// most likely to grow a glob call permanently unchecked. The pattern covers
// the sync form and the awaited async form, since each returns native
// separators.
const GLOB_CALL = "\\b" + "glob" + "\\s*(?:\\.\\s*sync\\s*)?\\(";
// tests/ import toPosix from tests/lib/paths.js. Production code under
// scripts/ cannot import from tests/, so it inlines the same replacement.
const NORMALIZED = new RegExp(
  "\\.map\\(toPosix\\)|" + "split\\(" + '"' + "\\\\\\\\" + '"' + "\\)",
);

// Blanks out whole-line comments while preserving line numbers, so prose
// describing the rule (in this file and in site-files.js) is not read as a
// call site. Trailing comments are left alone: they cannot hide a call.
function stripCommentLines(src) {
  return src
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*")
        ? ""
        : line;
    })
    .join("\n");
}

// Whole-file scan rather than line-by-line: prettier wraps a multi-argument
// call as `glob` then `.sync(...)` on the next line, which is exactly the
// shape a call takes once `.map(toPosix)` is appended to it. A per-line match
// cannot see that form, so the gate would go blind to the very call sites it
// was added to protect.
function findGlobViolations(file, source) {
  const src = stripCommentLines(source);
  const offenders = [];
  const re = new RegExp(GLOB_CALL, "g");
  let match;
  while ((match = re.exec(src)) !== null) {
    // Enough to cover the arguments plus the chained calls after them.
    const window = src.slice(match.index, match.index + 400);
    if (NORMALIZED.test(window)) continue;
    const line = src.slice(0, match.index).split("\n").length;
    offenders.push(`${file}:${line}: glob.sync without path normalization`);
  }
  return offenders;
}

describe("Glob call sites", () => {
  // --cached --others --exclude-standard, the same enumeration the em dash,
  // docs and shell-string gates settled on: a glob call in a file an agent
  // just wrote is caught before it is staged, which is when the Stop hook
  // runs.
  const files = execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "tests",
      "scripts",
      "vite.config.js",
    ],
    { cwd: rootDir, encoding: "utf-8" },
  )
    .split("\0")
    .filter((f) => f.endsWith(".js"));

  it("finds the files it is meant to scan", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("normalize their results", () => {
    const offenders = [];
    for (const file of files) {
      const full = path.join(rootDir, file);
      if (!fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
      offenders.push(
        ...findGlobViolations(file, fs.readFileSync(full, "utf-8")),
      );
    }

    expect(
      offenders,
      "glob returns backslash paths on Windows; add .map(toPosix) from " +
        "tests/lib/paths.js, or inline the same replacement under scripts/",
    ).toEqual([]);
  });

  // Both misses in the #119 review cycle were a check that was narrower than
  // the rule it enforced. Asserting the known-bad and known-good shapes here
  // keeps that from happening silently again.
  it("still detects each unnormalized shape (self-test against a fixture)", () => {
    // Assembled rather than spelled out, so the fixtures are not themselves
    // read as call sites when this file is scanned.
    const CALL = "glob" + '.sync("a/**/*.js"';
    const ASYNC_CALL = "glob" + '("a/**/*.png"';
    const WRAPPED =
      "glob" + '\n  .sync("a/**/*.js", {\n    cwd: rootDir,\n  })';
    const inline = '.map((p) => p.split("\\\\").join("/"))';
    const bad = {
      single: `${CALL}, { cwd: rootDir });`,
      wrapped: `const x = ${WRAPPED}\n  .sort();`,
      spaced: "glob" + ' . sync ("a/**/*.js");',
      commentedRuleNearby: `// never write ${CALL})\n${CALL});`,
      asyncForm: `await ${ASYNC_CALL}, { nodir: true });`,
    };
    const good = {
      single: `${CALL}, { cwd: rootDir }).map(toPosix);`,
      wrapped: `const x = ${WRAPPED}\n  .map(toPosix)\n  .sort();`,
      inlined: `${CALL})\n  ${inline};`,
      commentOnly: `// never write ${CALL})`,
      asyncForm: `await ${ASYNC_CALL})\n  ${inline};`,
      importLine: 'import { glob } from "glob";',
    };

    for (const [name, src] of Object.entries(bad)) {
      expect(findGlobViolations(`${name}.js`, src).length, name).toBe(1);
    }
    for (const [name, src] of Object.entries(good)) {
      expect(findGlobViolations(`${name}.js`, src), name).toEqual([]);
    }
  });
});
