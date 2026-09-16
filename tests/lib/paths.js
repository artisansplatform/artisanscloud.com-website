// glob and the fs/path APIs return native separators, so on Windows they hand
// back backslash paths while git (ls-files, grep, check-ignore) always emits
// forward slashes. Every place the two meet goes through here first.
export function toPosix(p) {
  return p.split("\\").join("/");
}
