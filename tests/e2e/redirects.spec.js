import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

// Every vercel.json redirect is requested for real (the preview server
// simulates them, see vite.config.js) and must answer with Vercel's status (308
// permanent, 307 otherwise) and its destination, which in turn must load. tests/conventions.test.js only
// validates the JSON; this is the check that the rule actually fires.
const { redirects } = JSON.parse(
  fs.readFileSync(path.join(rootDir, "vercel.json"), "utf-8"),
);

test.describe("vercel.json redirects", () => {
  for (const { source, destination, permanent } of redirects) {
    test(`${source} redirects to ${destination}`, async ({ request }) => {
      const res = await request.get(source, { maxRedirects: 0 });
      expect(res.status()).toBe(permanent === false ? 307 : 308);
      expect(res.headers()["location"]).toBe(destination);

      const target = await request.get(destination, { maxRedirects: 0 });
      expect(target.status()).toBe(200);
    });
  }
});
