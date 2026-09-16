// Single source of truth for the brand palette.
//
// The palette used to be copy-pasted: three hex strings in the @theme block,
// three more in the OG image generator, one in the team card template, and a
// few hundred literals scattered through markup and SVG assets. Correcting a
// brand color meant finding every copy by hand, which is exactly how the
// original drift (#8d68f6 for Purple, and so on) survived unnoticed.
//
// Everything that needs a brand color now reads it from here, and this module
// reads it from the @theme block in assets/style/input.css. The theme is the
// operative definition (it is what the site renders with); the master logo
// artwork is the authority the theme is checked against by
// tests/brand-colors.test.js.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

export const LOGO = "assets/image/logo.svg";
export const THEME = "assets/style/input.css";

// The three colors the logo defines, the token each one lives in, and the
// values that token has been corrected away from.
//
// `superseded` does double duty: tests/brand-colors.test.js bans those hexes
// from source so the old value cannot creep back, and scripts/recolor-svgs.js
// uses the same list to rewrite standalone SVG assets when a color changes.
// When a brand color legitimately changes, move the outgoing hex into this
// list and run `npm run recolor:svgs`.
export const BRAND = [
  {
    name: "Purple",
    key: "primary",
    token: "--color-primary",
    superseded: ["#8d68f6"],
  },
  {
    name: "Cyan",
    key: "sky",
    token: "--color-sky",
    superseded: ["#13d9e4"],
  },
  {
    name: "Pink",
    key: "pink",
    token: "--color-pink",
    superseded: ["#fc4bda"],
  },
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

// Every --color-* token declared in the @theme block, keyed by its full token
// name. Only the @theme block is parsed, so a token redefined further down the
// stylesheet for a local override cannot be mistaken for the palette itself.
export function themeTokens() {
  const css = read(THEME);
  const block = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error(`no @theme block found in ${THEME}`);
  const tokens = {};
  const re = /(--color-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(block[1])) !== null) tokens[m[1]] = m[2].trim();
  return tokens;
}

// The same tokens keyed by short name, which is what generators want:
// colors().primary, colors().heading, colors()["primary-light"].
export function colors() {
  const out = {};
  for (const [token, value] of Object.entries(themeTokens())) {
    out[token.replace(/^--color-/, "")] = value;
  }
  return out;
}

// The three brand colors only, lowercased, keyed by short name.
export function brandColors() {
  const tokens = themeTokens();
  const out = {};
  for (const { key, token, name } of BRAND) {
    const value = tokens[token];
    if (!value) throw new Error(`${THEME} is missing ${token} (${name})`);
    out[key] = value.toLowerCase();
  }
  return out;
}

// Old hex (lowercase, no leading #) -> what it should become. Used by the
// recolor script and by the guard test's ban list.
export function supersededMap() {
  const current = brandColors();
  const map = new Map();
  for (const { key, name, token, superseded } of BRAND) {
    for (const old of superseded) {
      map.set(old.toLowerCase().slice(1), {
        hex: current[key],
        name,
        token,
      });
    }
  }
  return map;
}

// Every 6-digit hex the master logo paints with, lowercased. The logo is the
// authority for what the brand colors actually are: the brand guidelines PDF
// prints three garbled codes, the artwork carries the real ones.
export function logoColors() {
  const svg = read(LOGO);
  const found = new Set();
  const re = /(?:fill|stroke|stop-color)\s*=\s*"(#[0-9a-fA-F]{6})"/g;
  let m;
  while ((m = re.exec(svg)) !== null) found.add(m[1].toLowerCase());
  return found;
}
