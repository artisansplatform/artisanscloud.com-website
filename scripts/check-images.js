#!/usr/bin/env node
import { statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname, relative } from "node:path";
import { glob } from "glob";

const THRESHOLDS_KB = {
  ".png": 300,
  ".jpg": 300,
  ".jpeg": 300,
  ".webp": 400,
  ".svg": 50,
};

const IMAGE_EXTS = Object.keys(THRESHOLDS_KB);

function isImage(p) {
  return IMAGE_EXTS.includes(extname(p).toLowerCase());
}

const rawArgs = process.argv.slice(2);
const stagedMode = rawArgs.includes("--staged");
const pathArgs = rawArgs.filter((a) => a !== "--staged");

async function resolvePaths(args) {
  if (args.length > 0) return args.filter(isImage);
  // glob returns native separators; `git cat-file -s :path` in --staged mode
  // only understands forward slashes, and would silently size nothing on
  // Windows.
  const found = await glob("assets/**/*.{png,jpg,jpeg,webp,svg}", {
    nodir: true,
  });
  return found.map((p) => p.split("\\").join("/"));
}

function getStagedSize(p) {
  // Read the size of the version of `p` that is staged for commit.
  // This may differ from the working-tree size if the file was modified
  // after `git add` (or staged in pieces).
  try {
    const out = execFileSync("git", ["cat-file", "-s", `:${p}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return parseInt(out.trim(), 10);
  } catch {
    return null;
  }
}

function getWorkingTreeSize(p) {
  try {
    return statSync(p).size;
  } catch {
    return null;
  }
}

const paths = await resolvePaths(pathArgs);
const oversized = [];

for (const p of paths) {
  const size = stagedMode ? getStagedSize(p) : getWorkingTreeSize(p);
  if (size == null) continue;
  const ext = extname(p).toLowerCase();
  const limitKB = THRESHOLDS_KB[ext];
  if (!limitKB) continue;
  const sizeKB = size / 1024;
  if (sizeKB > limitKB) {
    oversized.push({ path: p, sizeKB, limitKB, ext });
  }
}

if (oversized.length === 0) {
  if (paths.length > 0) {
    console.log(
      `Image check passed (${paths.length} file${paths.length === 1 ? "" : "s"} under size limits).`,
    );
  }
  process.exit(0);
}

console.error("");
console.error(
  `Found ${oversized.length} oversized image${oversized.length === 1 ? "" : "s"}:`,
);
console.error("");
for (const { path: p, sizeKB, limitKB } of oversized) {
  const rel = relative(process.cwd(), p);
  console.error(`  ${rel}`);
  console.error(`    ${sizeKB.toFixed(0)} KB (limit: ${limitKB} KB)`);
}
console.error("");

const svgOversized = oversized.filter((o) => o.ext === ".svg");
const rasterOversized = oversized.filter((o) => o.ext !== ".svg");

if (rasterOversized.length > 0) {
  const fileArgs = rasterOversized.map((o) => `"${o.path}"`).join(" ");
  console.error("To optimize, run:");
  console.error(`  npm run optimize:images -- ${fileArgs}`);
  console.error("");
}
if (svgOversized.length > 0) {
  console.error(
    "SVGs are not auto-optimized. Run them through https://jakearchibald.github.io/svgomg/",
  );
  console.error("or strip embedded raster data manually.");
  console.error("");
}
console.error(
  "To bypass this check for an exceptional case, commit with --no-verify.",
);
console.error("");

process.exit(1);
