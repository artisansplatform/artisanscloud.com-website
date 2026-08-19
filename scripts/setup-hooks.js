import { execFileSync } from "child_process";

// Runs on every `npm install` / `npm ci`. This must never fail the install:
// tarball installs, CI caches, and Docker COPY of the source tree all run
// `npm install` outside a git checkout, where `git config` has nothing to do.
try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    stdio: "ignore",
  });
} catch {
  console.error("setup-hooks: not a git checkout, skipping core.hooksPath");
}
process.exit(0);
