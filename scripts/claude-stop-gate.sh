#!/usr/bin/env bash
# Fast quality gate for the Claude Code Stop hook (.claude/settings.json).
#
# Runs the source-level test suites (everything that does not need a built
# dist/) and blocks the agent from finishing while any of them fail: exit 2
# makes the hook blocking and feeds stderr back to the agent. CI still runs
# the full suite; this is the fast local feedback loop.
#
# A tree-hash cache (.claude/.stop-gate-last-green, gitignored) makes the
# gate free when nothing changed since the last green run.
set -uo pipefail
cd "$(dirname "$0")/.."

STATE_FILE=".claude/.stop-gate-last-green"
tree_hash=$({ git rev-parse HEAD 2>/dev/null; git status --porcelain 2>/dev/null; git diff 2>/dev/null; } | git hash-object --stdin 2>/dev/null)

if [[ -n "$tree_hash" && -f "$STATE_FILE" && "$(cat "$STATE_FILE")" == "$tree_hash" ]]; then
  exit 0
fi

FAST_SUITES=(
  tests/conventions.test.js
  tests/docs.test.js
  tests/font-subset.test.js
  tests/format.test.js
  tests/links.test.js
  tests/pages-meta.test.js
)
# coverage-guard's sitemap check needs dist/; include it only when built.
if [[ -d dist ]]; then
  FAST_SUITES+=(tests/coverage-guard.test.js)
fi

if output=$(npx vitest run "${FAST_SUITES[@]}" 2>&1); then
  if [[ -n "$tree_hash" ]]; then printf '%s\n' "$tree_hash" >"$STATE_FILE"; fi
  exit 0
fi

echo "Fast quality gate failed; fix before finishing (npm test runs the full suite):" >&2
echo "$output" | tail -40 >&2
exit 2
