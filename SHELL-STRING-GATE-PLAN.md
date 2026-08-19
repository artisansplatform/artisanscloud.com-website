# Implementation Plan: Ban shell-string child processes (issue #118, step 6)

Status: plan only, no code changed yet.

## Goal

Make "never shell out with a command string" a test instead of a review habit.
`execSync(cmd)` and friends hand the command to a shell, so any path with a
space, a glob character, or a quote is re-parsed by that shell. On Windows the
shell is `cmd.exe` and the quoting rules differ from POSIX, which is exactly
the bug class the #113 review caught by hand. `execFileSync("git", [...])`
passes the args array straight to the process and has none of that.

This step is purely preventive: there are zero violations today.

## Current state (verified in this working tree)

- Every child-process call site already uses `execFileSync` from
  `node:child_process` / `child_process`:
  - `scripts/check-images.js` (`git cat-file -s`)
  - `tests/conventions.test.js` (`git grep`)
  - `tests/docs.test.js` (`git ls-files`, `git check-ignore`)
  - `tests/coverage-guard.test.js` (`git ls-files`, with a comment
    already explaining why it is not a shell string)
  - `tests/format.test.js` (the pinned prettier binary)
- Nothing in the repo passes `shell: true`, and nothing uses `exec`,
  `execSync`, `spawn`, `spawnSync`, or `fork`. The one `.exec(` hit in
  `tests/docs.test.js` is `RegExp.prototype.exec`, which the regex below
  must not flag.
- `api/` (Vercel serverless functions: `api/articles.js`, `api/cron/*`,
  `api/lib/*`) does no process spawning at all. It is `fetch` plus
  `@vercel/blob`. No backend change is needed, but the API path is worth
  including in scope so a future cron helper cannot introduce one.
- Config files at the root: `vite.config.js`, `playwright.config.js`,
  `.prettierrc.json`, `.prettierignore`, `vercel.json`, `package.json`.
  Only the two `.js` ones can hold a call site.
- `tests/conventions.test.js` is the established home for repo-wide source
  rules (inline scripts, Swiper selectors, redirects, em dashes) and already
  owns the `git grep` + exemption-list + instructive-failure pattern this
  check should copy. There is a `test:conventions` npm script; no new script
  is needed.
- Shell scripts (`.githooks/pre-commit`) are genuinely shell and out of scope.
  The hook calls `node scripts/check-images.js`, so the risky work stays in JS.

## What to build

### 1. New suite in `tests/conventions.test.js`

Add one `describe("No shell-string child processes", ...)` block at the end of
the file, next to the em dash check.

**Scope.** Tracked JavaScript under `scripts/`, `tests/`, `api/`, plus the two
root config files. Discover the file list with
`execFileSync("git", ["ls-files", "-z", "--", "scripts", "tests", "api",
"*.config.js"])` and filter to `.js` / `.mjs` / `.cjs`. Using git (not a glob)
keeps `dist/`, `node_modules/`, and untracked scratch files out, and matches
how `tests/docs.test.js` already enumerates files. Deliberately excluded:
`assets/script/**` (browser code, no `child_process` available) and
`tests/e2e/**` is included, since Playwright specs can shell out too.

**The check.** For each file, flag:

- `execSync(` and `spawnSync(` used with a command string. Simplest defensible
  rule, and the one the issue names: ban the identifiers outright. Both have
  safe-ish array forms only in the `spawnSync(cmd, args)` shape, but the repo
  has no use for either, so a flat ban is clearer than a shape analysis.
- `exec(` and `execFile(`/`spawn(` when preceded by an import from
  `child_process`. To avoid a parser, key the whole check off the import: only
  scan files that import from `child_process` / `node:child_process`, then
  match the imported binding names. This is what stops
  `spanRe.exec(line)` in `tests/docs.test.js` from being flagged, because
  `exec` there is a method call on a regex, not the imported binding.
- Any `shell: true` option object, in any file, whatever the callee.

Concretely: parse the import specifier list out of the
`import { ... } from "child_process"` statement, build a set of banned bindings
(`exec`, `execSync`, `spawn`, `spawnSync`, `fork`, `execFile` is allowed only
in its `Sync`/callback array form so keep it off the ban list), and match
`(^|[^.\w])<binding>\s*\(` so member expressions never match. Handle the
`import cp from "child_process"` shape too, by banning `cp.execSync(` style
member calls on that default binding.

**Self-flagging trap.** The test file will itself contain the banned words in
its regex source and in its failure message. Build the identifiers by string
concatenation, the way the em dash test uses the U+2014 character itself:

```js
const BANNED = ["exec" + "Sync", "spawn" + "Sync", "spawn", "exec", "fork"];
```

and construct the regex from those pieces rather than writing a literal. Then
add a third assertion (below) that proves the check can still see a violation,
so the concatenation trick cannot silently neuter it.

**Failure message.** Name the file, the line number, and the fix:
"use execFileSync(cmd, [args]) instead; a command string is re-parsed by the
shell and breaks on paths with spaces or on Windows cmd.exe."

### 2. Self-test so the gate cannot rot

The em dash test would fail loudly if it broke, because violations appear
naturally. This one guards against a class that currently has zero instances,
so a typo in the regex would make it pass forever while checking nothing. Add
a second `it` that runs the same matcher over a small inline fixture string
containing one of each banned form and asserts it reports them all. That keeps
the detector honest without touching the filesystem.

### 3. Docs (mandatory per the Documentation Rule)

- `docs/development.md`, "Automated guardrails" table: extend the
  `tests/conventions.test.js` row's "What it catches" cell with "shell-string
  child processes". Careful: `tests/docs.test.js` now enforces table shape, so
  keep the row on one line and keep the pipe count intact.
- `docs/development.md`, after the formatting paragraph: a short paragraph
  stating the rule and the reason (Windows quoting, spaces in paths), with the
  one approved form `execFileSync(cmd, [args], { cwd, encoding })`.
- `docs/coding-standards.md`: add the same rule under the security/quality
  section, since "do not build a command string from data" is a coding
  standard, not only a test.
- `CLAUDE.md`, Gotchas & Landmines: one bullet. The rule is machine-enforced,
  so per the Documentation Rule prose is optional, but agents write most of
  the `scripts/` code here and the bullet is what steers them at write time
  rather than at test time. Keep it to one line pointing at the test.

## Order of work

1. Write the `describe` block plus the self-test fixture in
   `tests/conventions.test.js`.
2. Run `npm run test:conventions`. Expect: new suite passes, zero violations.
3. Sanity-check the detector by temporarily adding a real `execSync` call to a
   scratch file under `scripts/`, confirming the failure message, then
   removing it. (The fixture self-test covers this permanently; this is a
   one-off confirmation that file discovery works too.)
4. Update the four docs above.
5. `npm run prettier`, then `npm test` (full suite: the new text must satisfy
   the docs table check, the file-reference check, the em dash rule, and the
   formatting gate from steps 1 through 5).

## Risks and how they are handled

| Risk                                                           | Handling                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The test file flags itself on its own regex source             | Build identifiers by string concatenation, same trick as the em dash test                                                                              |
| `regex.exec(...)` and `str.replace(...)` style false positives | Only scan files importing `child_process`, and require a non-`.`, non-word char before the binding                                                     |
| A zero-violation check silently stops working                  | Fixture self-test asserts the matcher still catches each banned form                                                                                   |
| Doc edits break the step 2/3 docs gate                         | Keep table rows single-line; only reference paths that exist                                                                                           |
| Someone legitimately needs a shell (piping, globbing)          | No exemption list for now, nothing needs one. If a case appears, do the work in JS or add an `EXEMPT` array with a comment, mirroring the em dash test |

## Out of scope

- Rewriting `.githooks/pre-commit`. It is a shell script by design.
- The `cp -r` in `build:static` and the POSIX `2>/dev/null || true` in
  `prepare`. Those are npm script strings, not child-process calls, and are
  step 7 of the issue.
- Adding a Windows CI job to actually prove the cross-platform claim. That is
  step 8 and depends on step 7.
