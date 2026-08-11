import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { allPages, partialFiles } from "../scripts/lib/site-files.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Tailwind font-weight utility -> numeric weight.
const WEIGHT_CLASS = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// Poppins is self-hosted: every variant the site can render is declared as an
// @font-face block here, with the woff2 files in assets/fonts/poppins/.
const FONT_FACE_SOURCE = "assets/style/input.css";

// The two head templates that preload font files. They must stay in sync so
// root pages (partial) and team cards (generator) warm the same variants.
const PRELOAD_SOURCES = [
  "partials/head-meta.html",
  "scripts/generate-team-cards.js",
];

// Files whose markup decides which font variants the browser actually renders:
// every page (shared recursive discovery), every partial, and the JS modules
// that render markup at runtime.
function markupFiles() {
  return [
    ...allPages(),
    ...partialFiles(),
    ...glob.sync("assets/script/**/*.js", { cwd: rootDir }),
  ];
}

function read(rel) {
  return fs.readFileSync(path.join(rootDir, rel), "utf-8");
}

// Parse Poppins @font-face blocks into a set of "ital,weight" keys, e.g.
// "0,400" (normal 400), "1,600" (italic 600), plus the woff2 paths they load.
function parseFontFaces(content) {
  const variants = new Set();
  const files = [];
  for (const m of content.matchAll(/@font-face\s*{([^}]+)}/g)) {
    const body = m[1];
    if (!/font-family:\s*["']?Poppins/.test(body)) continue;
    const style = body.match(/font-style:\s*(\w+)/)?.[1];
    const weight = body.match(/font-weight:\s*(\d+)/)?.[1];
    const src = body.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if (!style || !weight || !src) continue;
    variants.add(`${style === "italic" ? 1 : 0},${weight}`);
    files.push(src);
  }
  return { variants, files };
}

// Font file basenames preloaded by a head template.
function preloadedFonts(content) {
  return [
    ...content.matchAll(
      /rel=["']preload["'][^>]*href=["']([^"']+\.woff2)["']|href=["']([^"']+\.woff2)["'][^>]*rel=["']preload["']/g,
    ),
  ]
    .map((m) => path.basename(m[1] || m[2]))
    .sort();
}

// Variant keys (ital,weight) required by a single class attribute value.
function requiredFromClassValue(value) {
  const tokens = value.split(/\s+/);
  const isItalic = tokens.includes("italic"); // distinct token, not "not-italic"
  const weights = [];
  for (const token of tokens) {
    const named = token.match(/^font-(\w+)$/);
    if (named && WEIGHT_CLASS[named[1]] !== undefined) {
      weights.push(WEIGHT_CLASS[named[1]]);
    }
    const arbitrary = token.match(/^font-\[(\d+)\]$/);
    if (arbitrary) weights.push(Number(arbitrary[1]));
  }
  // Italic text with no explicit weight class renders at the default 400.
  const effective = weights.length ? weights : isItalic ? [400] : [];
  const required = [];
  for (const w of effective) {
    required.push(`0,${w}`);
    if (isItalic) required.push(`1,${w}`);
  }
  return required;
}

describe("Self-hosted font subset stays in sync with usage", () => {
  const { variants, files } = parseFontFaces(read(FONT_FACE_SOURCE));

  it("declares Poppins @font-face blocks in the stylesheet", () => {
    expect(
      variants.size,
      `${FONT_FACE_SOURCE}: no Poppins @font-face blocks found`,
    ).toBeGreaterThan(0);
  });

  it("ships every woff2 file the @font-face blocks reference", () => {
    // src urls are relative to the stylesheet's directory unless root-absolute.
    const missing = files.filter(
      (src) =>
        !fs.existsSync(
          src.startsWith("/")
            ? path.join(rootDir, src)
            : path.resolve(rootDir, "assets/style", src),
        ),
    );
    expect(
      missing,
      `@font-face src files missing from assets/fonts/: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("does not load fonts from Google any more", () => {
    for (const file of [FONT_FACE_SOURCE, ...PRELOAD_SOURCES]) {
      expect(
        read(file),
        `${file}: still references Google Fonts; Poppins is self-hosted`,
      ).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    }
  });

  it("preloads the same existing font files from the partial and the team-card generator", () => {
    const [partial, generator] = PRELOAD_SOURCES.map((f) =>
      preloadedFonts(read(f)),
    );
    expect(partial.length, "head-meta.html preloads no fonts").toBeGreaterThan(
      0,
    );
    expect(
      partial,
      `${PRELOAD_SOURCES[0]} and ${PRELOAD_SOURCES[1]} preload different font files`,
    ).toEqual(generator);
    const missing = partial.filter(
      (f) => !fs.existsSync(path.join(rootDir, "assets/fonts/poppins", f)),
    );
    expect(
      missing,
      `preloaded fonts missing on disk: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("declares every font weight/style the markup actually uses", () => {
    // variant key -> example "file: class snippet" for actionable failures
    const missing = new Map();
    for (const file of markupFiles()) {
      const content = read(file);
      for (const m of content.matchAll(/class\s*=\s*["'`]([^"'`]*)["'`]/g)) {
        for (const variant of requiredFromClassValue(m[1])) {
          if (!variants.has(variant) && !missing.has(variant)) {
            missing.set(variant, `${file}: "${m[1].trim().slice(0, 80)}"`);
          }
        }
      }
    }

    const report = [...missing.entries()].map(([variant, where]) => {
      const [ital, weight] = variant.split(",");
      const style = ital === "1" ? "italic" : "normal";
      return `  ${style} ${weight}  (e.g. ${where})`;
    });

    expect(
      report,
      "Font weights/styles used in markup but NOT declared as @font-face.\n" +
        `Download the missing variants into assets/fonts/poppins/ and add ` +
        `@font-face blocks to ${FONT_FACE_SOURCE}, or remove the usage:\n` +
        report.join("\n"),
    ).toEqual([]);
  });
});
