import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Formatting gate: the repo must stay prettier-clean.
// Step 4 (commit 46a263a) ran the pinned prettier over the whole repo once.
// This test keeps it that way: any file prettier would still rewrite fails
// the build, except the grandfathered pages below, and that list can only
// shrink (test B).
// ---------------------------------------------------------------------------

// Each entry left unformatted on purpose: reformatting shifts whitespace in
// layouts built against the unformatted markup, so they need a visual pass
// (393px / 768px / 1280px) before their entry can be deleted.
const GRANDFATHERED = new Set([
  "POS.html",
  "browser-pos.html",
  "data-intelligence.html",
]);

function listDifferentFiles() {
  const prettierBin = require.resolve("prettier/bin/prettier.cjs");
  let stdout;
  try {
    stdout = execFileSync(
      process.execPath,
      [prettierBin, "--list-different", "."],
      { cwd: rootDir, encoding: "utf-8" },
    );
  } catch (err) {
    // prettier exits 1 when files differ, which is the case this test reads.
    // Any other status (2 = a file it could not parse) is a real failure, and
    // stdout still holds a partial list, so it must not be treated as a result.
    if (err.status !== 1) {
      if (err.stderr) err.message += `\n${err.stderr}`;
      throw err;
    }
    stdout = err.stdout;
  }
  return stdout
    .split("\n")
    .map((line) => line.trim().replace(/\\/g, "/"))
    .filter(Boolean);
}

const unformatted = listDifferentFiles();

describe("Formatting gate", () => {
  it("has no unformatted files outside the grandfathered set", () => {
    const unexpected = unformatted.filter((file) => !GRANDFATHERED.has(file));
    expect(
      unexpected,
      `These files are not prettier-formatted: ${unexpected.join(
        ", ",
      )}. Run "npm run prettier" to fix them.`,
    ).toEqual([]);
  });

  it("only shrinks the grandfathered list", () => {
    for (const file of GRANDFATHERED) {
      expect(
        fs.existsSync(path.join(rootDir, file)),
        `Grandfathered file ${file} no longer exists. Remove it from GRANDFATHERED in tests/format.test.js.`,
      ).toBe(true);
      expect(
        unformatted,
        `${file} is now prettier-formatted. Remove it from GRANDFATHERED in tests/format.test.js.`,
      ).toContain(file);
    }
  });
});
