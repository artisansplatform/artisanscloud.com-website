// Formatting is enforced, not requested.
//
// "A few legacy pages are not yet fully formatted" sat in the docs as prose
// while 44 files quietly failed prettier. This gate runs prettier --check on
// the whole repo (prettier reads .prettierignore itself) and only tolerates
// the shrinking grandfather list below.

import { execFileSync } from "child_process";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Legacy files allowed to stay unformatted, with the reason. Formatting HTML
// can shift whitespace-sensitive rendering, so these get cleaned only when
// someone can visually verify the page. Shrinking this list is free; the
// staleness check below makes sure a cleaned file cannot linger here.
const GRANDFATHERED = new Set([
  "POS.html",
  "browser-pos.html",
  "data-intelligence.html",
]);

// Run prettier through its resolved bin with the current node executable:
// no shell, no npx, identical behavior on every platform.
function prettierCheckFailures() {
  const bin = require.resolve("prettier/bin/prettier.cjs");
  try {
    execFileSync(process.execPath, [bin, "--check", "."], {
      cwd: rootDir,
      encoding: "utf-8",
    });
    return [];
  } catch (error) {
    if (error.status !== 1) throw error; // 1 = style issues; anything else is a real error
    return `${error.stdout ?? ""}\n${error.stderr ?? ""}`
      .split("\n")
      .map((line) => line.replace(/^\[warn\]\s+/, "").trim())
      .filter(
        (line) =>
          line &&
          !line.startsWith("Checking") &&
          !line.includes("Code style issues"),
      )
      .sort();
  }
}

describe("prettier formatting", () => {
  const failing = prettierCheckFailures();

  it("every file outside the grandfather list is formatted", () => {
    const offenders = failing.filter((f) => !GRANDFATHERED.has(f));
    expect(
      offenders,
      `Unformatted files. Run: npx prettier --write ${offenders.join(" ")}`,
    ).toEqual([]);
  });

  it("the grandfather list only shrinks", () => {
    const stale = [...GRANDFATHERED].filter((f) => !failing.includes(f));
    expect(
      stale,
      "GRANDFATHERED entries that are now clean (or deleted). Remove them " +
        "from tests/format.test.js so they stay enforced.",
    ).toEqual([]);
  });
});
