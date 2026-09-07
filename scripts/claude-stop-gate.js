import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const CACHE_FILE = path.join(rootDir, ".claude", ".stop-gate-last-green");
const UNTRACKED_HASH_LIMIT = 256 * 1024; // skip hashing content of large untracked files

// Source-level suites only. build.test.js and seo.test.js need a fresh
// `npm run build` first, which is the slow part this gate exists to avoid;
// CI still runs those.
export const BASE_SUITES = [
  "tests/brand-colors.test.js",
  "tests/conventions.test.js",
  "tests/docs.test.js",
  "tests/font-subset.test.js",
  "tests/format.test.js",
  "tests/links.test.js",
  "tests/pages-meta.test.js",
  "tests/platform.test.js",
];

function log(message) {
  process.stderr.write(`claude-stop-gate: ${message}\n`);
}

function exitOk(message) {
  if (message) log(message);
  process.exit(0);
}

function exitBlocked(message, details) {
  process.stderr.write(`${message}\n`);
  if (details) process.stderr.write(`${details}\n`);
  process.exit(2);
}

function tryGit(args) {
  return execFileSync("git", args, { cwd: rootDir, encoding: "utf-8" });
}

export function computeTreeDigest() {
  const head = tryGit(["rev-parse", "HEAD"]);
  // --untracked-files=all, not the default `normal`: `normal` collapses a new
  // directory to a single `?? dir/` line, so every file inside it is invisible
  // to the digest and adding one leaves the cache looking green.
  const status = tryGit(["status", "--porcelain", "--untracked-files=all"]);
  const diff = tryGit(["diff", "HEAD"]);

  const cacheRel = path.relative(rootDir, CACHE_FILE).replace(/\\/g, "/");
  const statusLines = status
    .split("\n")
    .filter((line) => !line.includes(cacheRel));
  const statusForHash = statusLines.join("\n");

  const untrackedFiles = statusLines
    .filter((line) => line.startsWith("??"))
    .map((line) => line.slice(3).trim())
    .filter(Boolean);

  const hash = crypto.createHash("sha1");
  hash.update(head);
  hash.update(statusForHash);
  hash.update(diff);

  for (const rel of untrackedFiles) {
    const abs = path.join(rootDir, rel);
    hash.update(rel);
    try {
      const stat = fs.statSync(abs);
      if (stat.isFile() && stat.size <= UNTRACKED_HASH_LIMIT) {
        hash.update(fs.readFileSync(abs));
      } else {
        hash.update(String(stat.size));
      }
    } catch {
      // file vanished between status and stat, ignore
    }
  }

  return hash.digest("hex");
}

function readCachedDigest() {
  try {
    return fs.readFileSync(CACHE_FILE, "utf-8").trim();
  } catch {
    return null;
  }
}

function writeCachedDigest(digest) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, digest);
  } catch (err) {
    log(`could not write cache file: ${err.message}`);
  }
}

function runVitest(suites) {
  const vitestPkg = require.resolve("vitest/package.json");
  const vitestBin = path.join(path.dirname(vitestPkg), "vitest.mjs");
  try {
    const out = execFileSync(process.execPath, [vitestBin, "run", ...suites], {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: "pipe",
    });
    return { passed: true, ranTests: true, output: out };
  } catch (err) {
    const output = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    // 1 = vitest ran and something failed. Anything else (a crash, a missing
    // binary, a config parse error) is the runner never having reported, which
    // must still block: a gate that cannot run is not a gate that passed.
    return { passed: false, ranTests: err.status === 1, output };
  }
}

function main() {
  if (process.env.CLAUDE_STOP_GATE === "off") {
    exitOk("disabled via CLAUDE_STOP_GATE=off");
  }

  let digest = null;
  try {
    digest = computeTreeDigest();
  } catch (err) {
    log(`could not compute tree digest, skipping cache: ${err.message}`);
  }

  if (digest) {
    const cached = readCachedDigest();
    if (cached && cached === digest) {
      exitOk("tree unchanged since last green run, skipping");
    }
  }

  const suites = [...BASE_SUITES];
  if (fs.existsSync(path.join(rootDir, "dist"))) {
    suites.push("tests/coverage-guard.test.js");
  }

  let result;
  try {
    result = runVitest(suites);
  } catch (err) {
    // Almost always vitest missing from node_modules. Blocking rather than
    // waving the turn through: a gate that silently no-ops is worse than no
    // gate, because nobody notices it stopped working.
    exitBlocked(
      "claude-stop-gate: could not start the test runner, so nothing was checked.",
      `${err.message}\nRun \`npm install\`, or set CLAUDE_STOP_GATE=off to bypass this hook deliberately.`,
    );
    return;
  }

  if (!result.passed) {
    const tail = result.output.split("\n").slice(-40).join("\n");
    exitBlocked(
      result.ranTests
        ? "claude-stop-gate: fast local test suites failed, fix before finishing."
        : "claude-stop-gate: the test runner exited without reporting, so nothing was checked.",
      tail,
    );
    return;
  }

  if (digest) writeCachedDigest(digest);
  exitOk("fast local test suites passed");
}

// Only run when invoked as the hook command, so the tests can import
// BASE_SUITES and computeTreeDigest without running the suite.
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}
