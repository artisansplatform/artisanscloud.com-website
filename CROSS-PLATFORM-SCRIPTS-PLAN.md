# Implementation Plan: Cross-platform npm scripts (issue #118, step 7)

Scope: make every script in `package.json` runnable on Windows `cmd.exe` as well as
POSIX shells, and add a test that keeps it that way. Step 8 (the `windows-latest` CI job)
depends on this and is **not** part of this plan; see `WINDOWS-CI-PLAN.md`.

Issue text for this step: "`build:static` uses `cp -r` (breaks on Windows cmd); replace
with `node -e "fs.cpSync('assets/og','dist/assets/og',{recursive:true})"`. Same for
`prepare` (`2>/dev/null || true` is POSIX-only). Prerequisite for step 8."

## Current state (verified in this repo)

Two scripts in `package.json` are POSIX-only:

| Script         | Current value                                               | Why it breaks on Windows                                                                                        |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `build:static` | `cp -r assets/og dist/assets/og`                            | `cp` is not a `cmd.exe` builtin and is not on PATH in a stock GitHub `windows-latest` image                     |
| `prepare`      | `git config core.hooksPath .githooks 2>/dev/null \|\| true` | `2>/dev/null` writes to a file literally named `nul` under a `NUL` directory; `\|\| true` has no `true` builtin |

`build:static` runs as part of `npm run build` (via `npm-run-all build:*`), and `prepare`
runs on every `npm install` / `npm ci`, so both are on the critical path for step 8.

Everything else already works on both platforms:

- `dev`, `build` use `npm-run-all` (a node binary, not shell globbing).
- `vite`, `tailwindcss`, `vitest`, `playwright`, `prettier` are node bins resolved by npm.
- All `node scripts/*.js` invocations are plain node.
- Every child process in `scripts/`, `tests/`, and `api/` already uses
  `execFileSync(cmd, [args])` (step 6 landed and `tests/conventions.test.js` enforces it).
- Scripts resolve paths through `path.resolve` / `path.join`, not hardcoded POSIX roots.

Out of scope but worth noting: `.githooks/pre-commit` is bash. Git for Windows ships its
own bash and runs hooks through it, so it keeps working; no change needed here.

## Changes

### 1. `build:static`

Replace with a node one-liner:

```
"build:static": "node -e \"require('fs').cpSync('assets/og','dist/assets/og',{recursive:true})\""
```

Quoting rule: double quotes outside, single quotes inside. `cmd.exe` only honors `"`, so
the reverse would break there. `fs.cpSync(..., { recursive: true })` creates
`dist/assets/og` if missing, which matches what `cp -r` does today when the destination
does not exist.

Alternative considered and rejected: moving this into `scripts/copy-static.js`. The
one-liner is what the issue asks for, has no error handling to speak of, and a file would
add a `scripts/` entry to document for no gain. (`prepare` below is the opposite case.)

### 2. `prepare`

The current form deliberately swallows failures so `npm install` still succeeds outside a
git checkout (npm tarball installs, CI caches, Docker COPY of the source tree). That
needs real error handling, so it becomes a small script rather than another `node -e`:

- New `scripts/setup-hooks.js`:
  - `execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" })`
    inside `try`/`catch`.
  - On failure, print one short line to stderr and `process.exit(0)` (never fail the
    install). Keep the message plain, no em dashes.
  - Short header comment explaining why failure is tolerated.
- `package.json`: `"prepare": "node scripts/setup-hooks.js"`.

### 3. New guard: `tests/conventions.test.js` (POSIX-only npm scripts)

Per the Documentation Rule, a new footgun gets a test before it gets prose. Add a
`describe("Cross-platform npm scripts")` block that reads `package.json` and flags any
script value containing a POSIX-shell construct:

- Bare use of a unix binary that Windows lacks, as the first token of the command or right
  after a separator: `cp`, `rm`, `mv`, `mkdir -p`, `cat`, `touch`, `echo` with redirect,
  `sed`, `grep`, `cd ... &&`.
- Shell operators and redirects: `2>`, `>/dev`, `||`, `&&`, `|`, backticks, `$(`, `$VAR`.
- Single-quoted outer arguments (`node -e 'x'`), which `cmd.exe` does not strip.

Design notes, matching the patterns already used in that file:

- Build the banned tokens by string concatenation where a literal would make the test file
  or `package.json` flag itself.
- Allow-list mechanism: a `CROSS_PLATFORM_EXEMPT` map from script name to a one-line reason,
  plus a staleness test that fails when an exempt script no longer matches (same shape as
  `PLANNED_FILES` in `tests/docs.test.js` and `GRANDFATHERED` in `tests/format.test.js`).
  Expect it to start empty.
- A fixture self-test (like the shell-string detector's) asserting the matcher still
  catches `cp -r a b`, `x 2>/dev/null || true`, and `node -e 'y'`.

Placement: `tests/conventions.test.js` rather than a new file, since it is the same
"config-level convention" family as the shell-string ban and reuses its `read()` helper.

## Verification

Run on Linux, in order:

1. `rm -rf dist && npm run build`, then confirm `dist/assets/og/` holds the same PNG count
   as `assets/og/` (`ls assets/og | wc -l` vs `ls dist/assets/og | wc -l`).
2. `git config --unset core.hooksPath && npm install`, then
   `git config core.hooksPath` prints `.githooks`.
3. `node scripts/setup-hooks.js` from a non-git temp dir exits 0 and prints its notice.
4. `npm run prettier` (package.json will be reformatted by the edit) then `npm test`,
   including the new conventions block. `tests/format.test.js` must stay green.
5. Sanity check the quoting the way Windows sees it:
   `node -e "console.log(require('fs').existsSync('assets/og'))"` with the exact
   outer-double/inner-single form used in the script.

Windows itself is only fully proven by step 8; that is the point of step 8.

## Documentation updates (mandatory, per the Documentation Rule)

- `docs/development.md`, "Automated guardrails" table: add a row (or extend the
  Conventions row's "What it catches" cell) for POSIX-only npm scripts, and a short prose
  paragraph next to the existing shell-string paragraph explaining the rule and the
  outer-double/inner-single quoting convention for `node -e`.
- `docs/development.md`, Commands / `docs/architecture.md` build process: note that
  `build:static` is a node `cpSync` call and `prepare` is `scripts/setup-hooks.js`.
- `docs/development.md`: describe `scripts/setup-hooks.js` (purpose, when it runs, why it
  never fails the install), since every new `scripts/` file needs an entry.
- `CLAUDE.md` Gotchas: one line under the existing "No shell-string child processes"
  bullet, in the same style: npm scripts must be cross-platform, use `node -e` or a
  `scripts/*.js` file instead of unix binaries and shell operators.
- The pre-commit hook's bash dependency is fine and needs no doc change.

## Commit plan

One PR, three commits, so review stays small:

1. `build: make build:static and prepare cross-platform` (package.json + `scripts/setup-hooks.js`)
2. `test: ban POSIX-only npm scripts` (conventions test + fixture self-test)
3. `docs: document the cross-platform npm script rule`

## Risks

- **`prepare` behavior change.** Today failure is silent; the new script prints a line to
  stderr. That is an improvement but will show up in `npm ci` logs on any non-git checkout.
  Keep it to one line, and keep the exit code 0.
- **Over-broad matcher.** A regex banning `|`, `&&`, and `$` can flag legitimate future
  scripts. The exemption map with a staleness test is the pressure valve; do not loosen the
  matcher on the first false positive.
- **Prettier reflow of `package.json`.** The escaped quotes in `build:static` are easy to
  get wrong by hand. Run `npm run prettier` and re-read the resulting line before commit.
- **`cpSync` requires Node 16.7+.** CI pins Node 24 and `package.json` has no `engines`
  field today; no action needed, but note it if an `engines` floor is ever added.
