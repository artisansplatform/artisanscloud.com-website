import fs from "fs";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

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

// The two places that declare the Google Fonts request. They must stay in sync
// so root pages (partial) and team cards (generator) load the same variants.
const FONT_URL_SOURCES = [
  "partials/head-meta.html",
  "scripts/generate-team-cards.js",
];

// Files whose markup decides which font variants the browser actually renders.
const MARKUP_GLOBS = [
  "*.html",
  "partials/*.html",
  "team/*.html",
  "assets/script/**/*.js",
];

function read(rel) {
  return fs.readFileSync(path.join(rootDir, rel), "utf-8");
}

// Pull the "ital,wght@..." variants out of a Google Fonts css2 URL into a set
// of "ital,weight" keys, e.g. "0,400" (normal 400), "1,600" (italic 600).
function parseSubset(content) {
  const url = content.match(/fonts\.googleapis\.com\/css2\?[^"'`\s)]+/)?.[0];
  if (!url) return null;
  const spec = url.match(/Poppins:ital,wght@([0-9,;]+)/)?.[1];
  if (!spec) return null;
  return new Set(spec.split(";"));
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

describe("Font subset stays in sync with usage", () => {
  const subsets = FONT_URL_SOURCES.map((f) => ({
    file: f,
    subset: parseSubset(read(f)),
  }));

  it("declares a parseable Poppins subset in every source", () => {
    for (const { file, subset } of subsets) {
      expect(
        subset,
        `${file}: could not find a Poppins css2 font URL`,
      ).toBeTruthy();
    }
  });

  it("loads the same variants from the partial and the team-card generator", () => {
    const [a, b] = subsets.map((s) => [...s.subset].sort().join(";"));
    expect(
      a,
      `${FONT_URL_SOURCES[0]} and ${FONT_URL_SOURCES[1]} request different Poppins variants`,
    ).toBe(b);
  });

  it("loads every font weight/style the markup actually uses", () => {
    const subset = subsets[0].subset;
    const files = MARKUP_GLOBS.flatMap((g) => glob.sync(g, { cwd: rootDir }));

    // variant key -> example "file: class snippet" for actionable failures
    const missing = new Map();
    for (const file of files) {
      const content = read(file);
      for (const m of content.matchAll(/class\s*=\s*["'`]([^"'`]*)["'`]/g)) {
        for (const variant of requiredFromClassValue(m[1])) {
          if (!subset.has(variant) && !missing.has(variant)) {
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
      "Font weights/styles used in markup but NOT loaded by the Google Fonts request.\n" +
        `Add them to the "family=Poppins:ital,wght@..." list in ${FONT_URL_SOURCES.join(" and ")} ` +
        "(then run npm run generate:cards), or remove the usage:\n" +
        report.join("\n"),
    ).toEqual([]);
  });
});
