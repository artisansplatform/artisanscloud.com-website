import { execFileSync } from "child_process";

// Runs on every `npm install` / `npm ci`. This must never fail the install:
// tarball installs, CI caches, and Docker COPY of the source tree all run
// `npm install` outside a git checkout, where `git config` has nothing to do.
try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    stdio: "ignore",
  });
} catch (err) {
  // Either git is not installed or this is not a checkout. Say which, rather
  // than asserting a reason that may not be the real one.
  const why =
    err.code === "ENOENT" ? "git is not on PATH" : "not a git checkout";
  console.error(`setup-hooks: ${why}, skipping core.hooksPath`);
}
process.exit(0);
