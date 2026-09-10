#!/usr/bin/env node

/**
 * Rewrites superseded brand hexes in standalone SVG assets.
 *
 * Inline SVG inside a page can reference the palette directly with
 * var(--color-primary), but a .svg file loaded through <img> is its own
 * document: it never sees the site's CSS variables, so its colors have to be
 * baked in. That is why a brand color change still has to touch those files,
 * and why doing it by hand across 40-odd assets was how the palette drifted in
 * the first place.
 *
 * The old-to-new mapping comes from `superseded` in scripts/lib/brand-tokens.js,
 * so this script needs no arguments and no hex literals of its own.
 *
 * Run:
 *   npm run recolor:svgs             # rewrite assets/ in place
 *   npm run recolor:svgs -- --check  # report only, non-zero exit if stale
 *   npm run recolor:svgs -- path/to/file.svg other/dir
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supersededMap } from "./lib/brand-tokens.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_TARGET = "assets";

const args = process.argv.slice(2);
const check = args.includes("--check");
const targets = args.filter((a) => !a.startsWith("--"));

function collect(target) {
  const abs = path.resolve(ROOT, target);
  const stat = fs.statSync(abs);
  if (stat.isFile()) return abs.endsWith(".svg") ? [abs] : [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    out.push(...collect(path.join(abs, entry.name)));
  }
  return out;
}

// Keep the file's own casing convention: these assets are exported from design
// tools with uppercase hexes, and rewriting them to lowercase would bury the
// real change in noise.
function matchCase(replacement, original) {
  return original === original.toUpperCase()
    ? replacement.toUpperCase()
    : replacement.toLowerCase();
}

function main() {
  const map = supersededMap();
  if (map.size === 0) {
    console.log("recolor-svgs: no superseded colors to rewrite.");
    return;
  }

  const pattern = new RegExp(`#(${[...map.keys()].join("|")})\\b`, "gi");
  const files = (targets.length ? targets : [DEFAULT_TARGET]).flatMap(collect);

  const changed = [];
  let total = 0;

  for (const file of files) {
    const before = fs.readFileSync(file, "utf-8");
    let count = 0;
    const after = before.replace(pattern, (hit) => {
      const target = map.get(hit.slice(1).toLowerCase());
      if (!target) return hit;
      count += 1;
      return matchCase(target.hex, hit.slice(1));
    });
    if (!count) continue;
    total += count;
    changed.push({ file: path.relative(ROOT, file), count });
    if (!check) fs.writeFileSync(file, after);
  }

  if (!changed.length) {
    console.log(`recolor-svgs: ${files.length} SVG files already current.`);
    return;
  }

  for (const { file, count } of changed) {
    console.log(`  ${file} (${count})`);
  }

  if (check) {
    console.error(
      `recolor-svgs: ${total} superseded hex values in ${changed.length} files. ` +
        `Run \`npm run recolor:svgs\` to fix.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `recolor-svgs: rewrote ${total} values in ${changed.length} files.`,
  );
}

main();
