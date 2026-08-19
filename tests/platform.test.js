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
describe("Glob call sites", () => {
  it("normalize their results", () => {
    const files = execFileSync("git", ["ls-files", "-z", "--", "tests/*.js"], {
      cwd: rootDir,
      encoding: "utf-8",
    })
      .split("\0")
      .filter(Boolean);

    const offenders = [];
    for (const file of files) {
      if (file === "tests/platform.test.js") continue;
      const src = fs.readFileSync(path.join(rootDir, file), "utf-8");
      const lines = src.split("\n");
      lines.forEach((line, idx) => {
        if (!/glob\.sync\(/.test(line)) return;
        const window = lines.slice(idx, idx + 4).join("\n");
        if (/\.map\(toPosix\)/.test(window)) return;
        offenders.push(`${file}:${idx + 1}: glob.sync without .map(toPosix)`);
      });
    }

    expect(
      offenders,
      "glob returns backslash paths on Windows; add .map(toPosix) from tests/lib/paths.js",
    ).toEqual([]);
  });
});
