import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { allPages } from "../scripts/lib/site-files.js";
import { BASE_SUITES, computeTreeDigest } from "../scripts/claude-stop-gate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(rootDir, rel), "utf-8");
}

// ---------------------------------------------------------------------------
// No inline executable scripts (CSP-readiness).
// All behavior must go through assets/script modules. Data blocks
// (application/ld+json, application/json) and external <script src> are fine.
// Meta-refresh redirect stubs are exempt: they are tiny standalone pages
// outside the module system.
// ---------------------------------------------------------------------------
describe("No inline executable scripts", () => {
  const pages = allPages();

  describe.each(pages)("%s", (page) => {
    it("has no inline <script> with executable code", () => {
      const html = read(page);
      if (/http-equiv=["']refresh["']/i.test(html)) return; // redirect stub

      const offenders = [];
      for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
        const attrs = m[1];
        if (/\bsrc=/i.test(attrs)) continue; // external script
        const type = attrs.match(/\btype=["']([^"']+)["']/i)?.[1] ?? "";
        if (/application\/(ld\+json|json)/i.test(type)) continue; // data block
        offenders.push(m[0]);
      }
      expect(
        offenders,
        `${page} has an inline executable <script>. Move the logic to an assets/script module imported by main.js (see modules/card-toggle.js).`,
      ).toEqual([]);
    });
  });
});

// ---------------------------------------------------------------------------
// Swiper slider selectors and their nav-button selectors must be unique.
// Reusing a class makes navigation control the wrong slider (or break).
// ---------------------------------------------------------------------------
describe("Swiper instances have unique selectors", () => {
  const src = read("assets/script/modules/swiper-sliders.js");

  function duplicates(values) {
    const seen = new Set();
    const dups = new Set();
    for (const v of values) (seen.has(v) ? dups : seen).add(v);
    return [...dups];
  }

  it("instantiates each Swiper with a unique selector", () => {
    const selectors = [...src.matchAll(/new Swiper\(\s*["']([^"']+)["']/g)].map(
      (m) => m[1],
    );
    expect(selectors.length).toBeGreaterThan(0);
    expect(
      duplicates(selectors),
      "Duplicate Swiper selector(s); each slider needs a unique class",
    ).toEqual([]);
  });

  it("uses unique navigation button selectors", () => {
    const navs = [
      ...src.matchAll(/(?:nextEl|prevEl):\s*["']([^"']+)["']/g),
    ].map((m) => m[1]);
    expect(
      duplicates(navs),
      "Duplicate Swiper nav button selector(s); next/prev classes must be unique per slider",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// vercel.json redirect integrity.
// ---------------------------------------------------------------------------
describe("vercel.json redirects are sound", () => {
  const vercel = JSON.parse(read("vercel.json"));
  const redirects = vercel.redirects ?? [];
  const pages = JSON.parse(read("assets/data/pages.json"));

  // Set of routes the site actually serves (clean URLs, no .html).
  const routes = new Set(
    allPages().map((f) =>
      f === "index.html" ? "/" : `/${f.replace(/\.html$/, "")}`,
    ),
  );
  const sources = new Set(redirects.map((r) => r.source));
  const isStub = (slug) =>
    /http-equiv=["']refresh["']/i.test(
      fs.existsSync(path.join(rootDir, `${slug}.html`))
        ? read(`${slug}.html`)
        : "",
    );

  it("has at least one redirect", () => {
    expect(redirects.length).toBeGreaterThan(0);
  });

  it("points every redirect at a destination that resolves", () => {
    const broken = redirects.filter((r) => {
      const dest = r.destination.replace(/[?#].*$/, "");
      return (
        !/^https?:\/\//.test(dest) && !routes.has(dest) && !sources.has(dest)
      );
    });
    expect(
      broken.map((r) => `${r.source} -> ${r.destination}`),
      "Redirect destination does not resolve to a page, another redirect, or an external URL",
    ).toEqual([]);
  });

  it("does not shadow a live content page with a redirect", () => {
    // A redirect whose source still resolves to a real, non-stub page means
    // visitors never see that page. Redirect stubs (retail-platform) are fine.
    const shadowed = redirects.filter((r) => {
      const slug = r.source.replace(/^\//, "");
      return routes.has(r.source) && slug && !isStub(slug);
    });
    expect(
      shadowed.map((r) => r.source),
      "Redirect source shadows a real content page; rename/remove the page or the redirect",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Redirect stubs (meta-refresh pages) must be excluded from the sitemap.
// ---------------------------------------------------------------------------
describe("Redirect stubs stay out of the sitemap", () => {
  const pages = JSON.parse(read("assets/data/pages.json"));
  const stubs = allPages()
    .filter((f) => /http-equiv=["']refresh["']/i.test(read(f)))
    .map((f) => f.replace(/\.html$/, ""));

  it.each(stubs)("%s is marked sitemap: false", (slug) => {
    expect(
      pages[slug]?.sitemap,
      `${slug}.html is a redirect stub; add "${slug}": { "sitemap": false } to pages.json so it is not indexed`,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// No em dashes anywhere in the codebase (CLAUDE.md, Global Writing Rules).
// Covers the literal character and the HTML entities that render as one, and
// the spaced en dash that gets used in an em dash's place.
//
// Files are listed with `git ls-files` (tracked plus untracked-but-not-ignored)
// and matched in Node rather than with `git grep`, for three reasons:
//   1. git grep never sees a file that has not been `git add`ed yet, so a file
//      an agent just wrote would sail past the gate.
//   2. Passing a literal em dash as an argv to git is a Windows encoding risk.
//   3. Entity forms need a real regex, not a fixed string.
// ---------------------------------------------------------------------------
describe("No em dashes in tracked files", () => {
  // Built from char codes, not "\u2014" literals, so the pattern below does
  // not match this file's own source once the entity forms are in it.
  const EM_DASH = String.fromCharCode(0x2014);
  const EN_DASH = String.fromCharCode(0x2013);
  // Assembled from parts for the same reason: spelled out, the entity names
  // below would make this file its own first offender.
  const ENTITIES = ["mdash;", "#8212;", "#x2014;"]
    .map((e) => "&" + e)
    .join("|");

  const BANNED = [
    { label: `em dash (U+2014)`, re: new RegExp(EM_DASH, "g") },
    { label: "em dash entity", re: new RegExp(ENTITIES, "gi") },
    // A spaced en dash is the em dash habit with a different codepoint.
    // Line start and end count as boundaries: wrapped copy puts the dash at
    // the end of a line often enough that leaving it out blinds the check to
    // the exact shape it is meant to catch.
    // Unspaced en dashes stay legal: they are correct in ranges like h1-h6.
    {
      label: `spaced en dash (U+2013)`,
      re: new RegExp(`(^|\\s|>)${EN_DASH}(\\s|<|$)`, "g"),
    },
  ];

  // fallback-articles.json carries external LinkedIn copy verbatim and is
  // regenerated by `npm run update-fallback`, so upstream punctuation is not ours to fix.
  const EXEMPT = new Set(["assets/data/fallback-articles.json"]);

  // .svg is deliberately absent: it is text and can carry an em dash in a
  // <title> or <text>, so it gets scanned. Only the gzipped .svgz is binary.
  const BINARY =
    /\.(png|jpe?g|gif|webp|avif|ico|svgz|woff2?|ttf|otf|eot|pdf|zip|gz|mp4|webm|mp3)$/i;

  it("contains no em dash, em dash entity, or spaced en dash", () => {
    const files = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      { cwd: rootDir, encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 },
    )
      .split("\0")
      .filter(Boolean)
      .filter((file) => !EXEMPT.has(file) && !BINARY.test(file));

    const offenders = [];
    for (const file of files) {
      const abs = path.join(rootDir, file);
      let stat;
      try {
        stat = fs.statSync(abs);
      } catch {
        continue; // deleted between listing and read
      }
      if (!stat.isFile()) continue;

      const lines = fs.readFileSync(abs, "utf-8").split("\n");
      lines.forEach((line, i) => {
        for (const { label, re } of BANNED) {
          re.lastIndex = 0;
          if (re.test(line)) {
            offenders.push(
              `${file}:${i + 1} (${label}) ${line.trim().slice(0, 100)}`,
            );
            break;
          }
        }
      });
    }

    expect(
      offenders,
      "Replace with a comma, period, colon, or parentheses (CLAUDE.md, Global Writing Rules)",
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// No shell-string child processes.
// exec/execSync take a command string that gets re-parsed by a shell
// (cmd.exe on Windows, with different quoting rules than POSIX), so any
// path with a space, glob character, or quote can break or be
// reinterpreted. `shell: true` does the same to any other API.
// spawn/spawnSync/fork/execFile* are NOT banned: they pass an args array
// straight to the process and never involve a shell on their own. spawn is
// the right tool for a streaming or long-running child, which execFileSync
// cannot do.
// ---------------------------------------------------------------------------
describe("No shell-string child processes", () => {
  // Built by concatenation so this file does not flag itself.
  const BANNED = ["exec" + "Sync", "exec"];

  function findViolations(filename, src) {
    const offenders = [];
    const lines = src.split("\n");

    const importMatch = src.match(
      /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+["'](?:node:)?child_process["']/,
    );
    const namedImports = importMatch?.[1]
      ? importMatch[1].split(",").map((s) =>
          s
            .trim()
            .split(/\s+as\s+/)
            .pop(),
        )
      : [];
    const defaultImport = importMatch?.[2];

    const bannedBindings = BANNED.filter((name) => namedImports.includes(name));

    lines.forEach((line, idx) => {
      for (const name of bannedBindings) {
        const re = new RegExp(`(^|[^.\\w])${name}\\s*\\(`);
        if (re.test(line)) {
          offenders.push(
            `${filename}:${idx + 1}: shell-string call \`${name}(...)\`; a command string is re-parsed by a shell and breaks on paths with spaces or on Windows cmd.exe. Use execFileSync(cmd, [args]), or spawn(cmd, [args]) for a streaming child.`,
          );
        }
      }
      if (defaultImport) {
        for (const name of BANNED) {
          const re = new RegExp(`(^|[^.\\w])${defaultImport}\\.${name}\\s*\\(`);
          if (re.test(line)) {
            offenders.push(
              `${filename}:${idx + 1}: shell-string call \`${defaultImport}.${name}(...)\`; a command string is re-parsed by a shell and breaks on paths with spaces or on Windows cmd.exe. Use execFileSync(cmd, [args]), or spawn(cmd, [args]) for a streaming child.`,
            );
          }
        }
      }
      if (/shell\s*:\s*true/.test(line)) {
        const shellOpt = "shell" + ": true";
        offenders.push(
          `${filename}:${idx + 1}: \`${shellOpt}\` option; a command string is re-parsed by the shell and breaks on paths with spaces or on Windows cmd.exe. Use execFileSync(cmd, [args]) instead.`,
        );
      }
    });

    return offenders;
  }

  it("has no shell-string child_process calls in scripts/, tests/, api/, or root config files (tracked and untracked)", () => {
    const out = execFileSync(
      "git",
      [
        "ls-files",
        "-z",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        "scripts",
        "tests",
        "api",
        "*.config.js",
      ],
      { cwd: rootDir, encoding: "utf-8" },
    );
    const tracked = out
      .split("\0")
      .filter(Boolean)
      .filter((f) => /\.(js|mjs|cjs)$/.test(f))
      // Contains this detector's own fixture, a string with fake banned
      // calls used by the self-test below; it is not real source.
      .filter((f) => f !== "tests/conventions.test.js");
    const files = [...new Set(tracked)];

    const offenders = files.flatMap((f) => findViolations(f, read(f)));

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("still detects each banned form (self-test against a fixture)", () => {
    const fixture = `
import { exec, execSync, spawn, spawnSync } from "child_process";
exec("ls -la");
execSync("rm -rf " + dir);
spawn("cmd", { shell: true });
`;
    const offenders = findViolations("fixture.js", fixture);
    for (const name of BANNED) {
      expect(
        offenders.some((o) => o.includes(`\`${name}(`)),
        `expected fixture self-test to catch ${name}(...)`,
      ).toBe(true);
    }
    expect(offenders.some((o) => o.includes("shell: true"))).toBe(true);
  });

  // spawn/spawnSync/fork with an args array never involve a shell, so they
  // are correct code, not the bug class. spawn is also the only option for a
  // streaming or long-running child, which execFileSync cannot handle.
  it("leaves shell-free array-args APIs alone (self-test against a fixture)", () => {
    const fixture = `
import { spawn, spawnSync, fork, execFileSync } from "child_process";
spawnSync("git", ["ls-files", "-z"], { encoding: "utf-8" });
spawn("node", ["server.js"]);
fork("./worker.js", ["--flag"]);
execFileSync("git", ["status"]);
`;
    expect(findViolations("fixture.js", fixture)).toEqual([]);
  });

  // A member call like regex.exec(...) must not be mistaken for child_process.
  it("does not flag member calls such as regex.exec (self-test)", () => {
    const fixture = `
import { exec } from "child_process";
const m = /a(b)/.exec(input);
const n = matcher.exec(line);
`;
    expect(findViolations("fixture.js", fixture)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Cross-platform npm scripts.
// package.json scripts run on Windows cmd.exe as well as POSIX shells (see
// step 8's windows-latest CI job). Bare unix binaries, shell operators, and
// single-quoted outer arguments to `node -e` are all POSIX-only.
// ---------------------------------------------------------------------------
describe("Cross-platform npm scripts", () => {
  // Scripts that intentionally need an exemption, with a one-line reason.
  // Expect this to stay empty; add an entry only when a script genuinely
  // cannot be made cross-platform.
  const CROSS_PLATFORM_EXEMPT = {};

  const UNIX_BINARIES = [
    "cp",
    "rm",
    "mv",
    "mkdir -p",
    "cat",
    "touch",
    "sed",
    "grep",
  ];
  // Built by concatenation so this file's own scripts do not flag it.
  const REDIRECT = "2" + ">";
  const DEV_NULL = "/dev" + "/null";
  const OR_OR = "|" + "|";
  const PIPE = "|";
  const BACKTICK = "`";
  const DOLLAR_PAREN = "$" + "(";

  // Everything a `node -e "..."` payload contains is JavaScript, not shell:
  // `||`, a template-literal backtick and `${x}` are all legal there and mean
  // nothing to cmd.exe. Scanning the payload as if it were shell rejects the
  // exact escape hatch the rule tells people to use, and with the wrong
  // reason. Blank the payload out before looking for shell constructs; the
  // outer quoting style is checked against the raw value first.
  const NODE_EVAL_DQ = /(-e|--eval|-p|--print)(\s+)"(?:[^"\\]|\\.)*"/g;
  const NODE_EVAL_SQ = /(-e|--eval|-p|--print)(\s+)'[^']*'/g;

  function stripNodeEval(value) {
    return value
      .replace(NODE_EVAL_DQ, '$1$2"<js>"')
      .replace(NODE_EVAL_SQ, "$1$2'<js>'");
  }

  function findScriptViolations(name, rawValue) {
    const offenders = [];

    // Checked on the raw value: this is about the quoting, not the payload.
    if (/\bnode(\.exe)?\s+(-e|--eval|-p|--print)\s+'/.test(rawValue))
      offenders.push(
        "single-quoted outer argument to `node -e`; cmd.exe does not strip single quotes, use double-quotes outside and single-quotes inside",
      );

    const value = stripNodeEval(rawValue);

    for (const bin of UNIX_BINARIES) {
      // A command position is the start of the value or just after a
      // separator, so `node scripts/rm-stale.js` is not a call to `rm`.
      const re = new RegExp(`(^|&&|\\|\\||\\||;)\\s*${bin}(\\s|$)`);
      if (re.test(value))
        offenders.push(
          `uses unix binary \`${bin}\`, which does not exist on Windows cmd.exe`,
        );
    }
    if (/\becho\b.*>/.test(value))
      offenders.push("uses `echo` with a redirect; quoting differs on cmd.exe");
    if (value.includes(REDIRECT))
      offenders.push(
        `uses \`${REDIRECT}\` redirect; cmd.exe has no equivalent for the null device path`,
      );
    if (value.includes(DEV_NULL))
      offenders.push(`references \`${DEV_NULL}\`, which is POSIX-only`);
    if (value.includes(OR_OR))
      offenders.push(
        `uses \`${OR_OR}\`; the fallback it guards is shell-dependent, put the error handling in a \`scripts/*.js\` file instead`,
      );
    if (value.split(OR_OR).join("").includes(PIPE))
      offenders.push(
        `uses a \`${PIPE}\` pipe; the command on either side is almost always a unix binary`,
      );
    if (value.includes(BACKTICK))
      offenders.push("uses backtick command substitution, which is POSIX-only");
    if (value.includes(DOLLAR_PAREN))
      offenders.push(
        `uses \`${DOLLAR_PAREN}\` command substitution, which is POSIX-only`,
      );
    if (/\$\w/.test(value))
      offenders.push(
        "references a shell env var (`$VAR`); cmd.exe spells it `%VAR%`",
      );

    return offenders;
  }

  const pkg = JSON.parse(read("package.json"));
  const scripts = pkg.scripts ?? {};

  it("has no POSIX-only construct in any npm script", () => {
    const offenders = [];
    for (const [name, value] of Object.entries(scripts)) {
      if (CROSS_PLATFORM_EXEMPT[name]) continue;
      for (const reason of findScriptViolations(name, value)) {
        offenders.push(`scripts.${name}: ${reason} (\`${value}\`)`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("keeps CROSS_PLATFORM_EXEMPT free of stale entries", () => {
    const stale = Object.keys(CROSS_PLATFORM_EXEMPT).filter((name) => {
      const value = scripts[name];
      return (
        value === undefined || findScriptViolations(name, value).length === 0
      );
    });
    expect(
      stale,
      "CROSS_PLATFORM_EXEMPT entry no longer matches a POSIX-only script; remove it",
    ).toEqual([]);
  });

  // Known-bad and known-good fixtures, asserted directly against the matcher.
  // A gate that only says "the suite passes" cannot tell a rule that holds
  // from a rule too narrow to notice, and it cannot tell a rule that holds
  // from one so broad it rejects correct code. Both halves are required.
  const BAD_FIXTURES = {
    "unix copy": "cp -r assets/og dist/assets/og",
    "unix remove": "rm -rf dist",
    "binary after a separator": "node scripts/build.js && rm -rf tmp",
    "binary after a pipe": "node scripts/list.js " + PIPE + " grep foo",
    "stderr to the null device": "git config a b " + REDIRECT + DEV_NULL,
    "or-fallback": "git config a b " + OR_OR + " true",
    pipe: "node scripts/list.js " + PIPE + " node scripts/count.js",
    "backtick substitution": "node scripts/x.js " + BACKTICK + "pwd" + BACKTICK,
    "paren substitution": "node scripts/x.js " + DOLLAR_PAREN + "pwd)",
    "shell env var": "node scripts/x.js $HOME",
    "single-quoted node -e": 'node -e \'require("fs").rmSync("dist")\'',
    "single-quoted node --eval": "node --eval 'process.exit(0)'",
  };

  // Every one of these is correct, portable code. If the matcher ever flags
  // one, the rule has grown past the bug class it is meant to cover.
  const GOOD_FIXTURES = {
    "current build:static":
      "node -e \"require('fs').cpSync('assets/og','dist/assets/og',{recursive:true})\"",
    "logical or inside a node -e payload":
      'node -e "const x = process.env.PORT || 3000; console.log(x)"',
    "template literal inside a node -e payload":
      'node -e "console.log(`built ${Date.now()}`)"',
    "regex alternation inside a node -e payload":
      'node -e "console.log(/a|b/.test(process.argv[2]))"',
    "and chain": "npm run build && vitest run",
    "npm-run-all glob": "npm-run-all --parallel dev:*",
    "script file whose name contains a binary name":
      "node scripts/grep-pages.js",
    "flag that looks like a binary": "vite build --mode cp",
    "plain node script": "node scripts/setup-hooks.js",
  };

  it("flags every known-bad script shape (self-test)", () => {
    const missed = Object.entries(BAD_FIXTURES)
      .filter(
        ([, value]) => findScriptViolations("fixture", value).length === 0,
      )
      .map(([label]) => label);
    expect(missed, `not flagged: ${missed.join(", ")}`).toEqual([]);
  });

  it("flags nothing in a known-good script shape (self-test)", () => {
    const falsePositives = Object.entries(GOOD_FIXTURES)
      .map(([label, value]) => [label, findScriptViolations("fixture", value)])
      .filter(([, offenders]) => offenders.length > 0)
      .map(([label, offenders]) => `${label}: ${offenders.join("; ")}`);
    expect(falsePositives, falsePositives.join("\n")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Claude Code Stop hook wiring. The hook is a local speed-up (fast test
// suites run before the agent finishes a turn); if the settings file rots,
// it silently becomes a no-op instead of failing loudly, so check it here.
// ---------------------------------------------------------------------------
describe("Claude Code Stop hook", () => {
  const settingsPath = path.join(rootDir, ".claude/settings.json");

  it("declares exactly one Stop hook command pointing at a file that exists", () => {
    expect(
      fs.existsSync(settingsPath),
      ".claude/settings.json is missing",
    ).toBe(true);
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    const stopGroups = settings.hooks?.Stop ?? [];
    const commands = stopGroups.flatMap((group) => group.hooks ?? []);

    expect(commands.length, "expected exactly one Stop hook command").toBe(1);

    const command = commands[0].command;
    const match = command.match(/"\$CLAUDE_PROJECT_DIR\/([^"]+)"/);
    expect(
      match,
      `Stop hook command does not reference a $CLAUDE_PROJECT_DIR-relative script: ${command}`,
    ).not.toBeNull();

    const scriptPath = path.join(rootDir, match[1]);
    expect(
      fs.existsSync(scriptPath),
      `Stop hook command points at ${match[1]}, which does not exist`,
    ).toBe(true);
  });

  it("runs suites that all exist", () => {
    const missing = BASE_SUITES.filter(
      (suite) => !fs.existsSync(path.join(rootDir, suite)),
    );
    expect(missing, `Stop hook lists suites that do not exist`).toEqual([]);
  });

  it("keeps `npm run test:fast` in step with the hook's suite list", () => {
    const pkg = JSON.parse(read("package.json"));
    const fast = (pkg.scripts?.["test:fast"] ?? "")
      .split(/\s+/)
      .filter((arg) => arg.endsWith(".test.js"));
    expect(
      fast,
      "test:fast and BASE_SUITES in scripts/claude-stop-gate.js have drifted; the documented by-hand equivalent must run the same suites",
    ).toEqual(BASE_SUITES);
  });

  // The gate skips its own run when the tree digest matches the last green
  // one, so a digest that cannot see a change is a gate that silently stops
  // gating. `git status --porcelain` alone collapses a new directory to one
  // `?? dir/` line, which hid every file inside it.
  it("notices a file added inside an untracked directory", () => {
    const probeDir = path.join(rootDir, "zz-stop-gate-probe");
    fs.rmSync(probeDir, { recursive: true, force: true });
    try {
      fs.mkdirSync(probeDir, { recursive: true });
      fs.writeFileSync(path.join(probeDir, "first.txt"), "one\n");
      const before = computeTreeDigest();

      fs.writeFileSync(path.join(probeDir, "second.txt"), "two\n");
      const afterNewFile = computeTreeDigest();
      expect(
        afterNewFile,
        "digest is blind to a new file inside an untracked directory",
      ).not.toBe(before);

      fs.writeFileSync(path.join(probeDir, "second.txt"), "two, edited\n");
      expect(
        computeTreeDigest(),
        "digest is blind to an edit of an untracked file",
      ).not.toBe(afterNewFile);
    } finally {
      fs.rmSync(probeDir, { recursive: true, force: true });
    }
  });
});
