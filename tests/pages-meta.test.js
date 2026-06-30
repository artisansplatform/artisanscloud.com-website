import fs from "fs";
import { glob } from "glob";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const pagesJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, "assets", "data", "pages.json"), "utf-8"),
);

// retail-platform.html is a meta-refresh redirect stub with a hand-written
// head; every other root page must use the shared head-meta partial.
// arena.html is a standalone third-party landing page with its own head.
const STUB_PAGES = new Set(["retail-platform.html", "arena.html"]);

const allPages = glob.sync("*.html", { cwd: rootDir });
const partialPages = allPages.filter((p) => !STUB_PAGES.has(p));

describe("pages.json / head-meta partial integrity", () => {
  it("discovers pages", () => {
    expect(partialPages.length).toBeGreaterThan(0);
  });

  describe.each(partialPages)("%s", (page) => {
    const slug = page.replace(/\.html$/, "");

    it("uses the head-meta partial instead of a hand-written head", () => {
      const source = fs.readFileSync(path.join(rootDir, page), "utf-8");
      expect(
        source.includes("{{> head-meta}}"),
        `${page} must render its head via {{> head-meta}}`,
      ).toBe(true);
      // No hand-maintained head tags allowed alongside the partial
      const head = source.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
      const strayTags = head.match(/<(title|meta|link)\b/g) ?? [];
      expect(
        strayTags,
        `${page} head should only contain {{> head-meta}} plus optional inline <script>/<style>`,
      ).toEqual([]);
    });

    it("has a pages.json entry with title and description", () => {
      const meta = pagesJson[slug];
      expect(
        meta,
        `${page} needs an entry in assets/data/pages.json`,
      ).toBeTruthy();
      expect(meta.title?.trim(), `${slug}: title required`).toBeTruthy();
      expect(
        meta.description?.trim(),
        `${slug}: description required`,
      ).toBeTruthy();
    });

    it("has its OG image committed when the OG block is enabled", () => {
      const meta = pagesJson[slug];
      if (!meta || meta.og === false) return;
      const imagePath = meta.ogImage
        ? meta.ogImage.replace(/^\//, "")
        : `assets/og/${slug}.png`;
      expect(
        fs.existsSync(path.join(rootDir, imagePath)),
        `${slug}: og image ${imagePath} missing. Run "npm run generate:og" and commit the result.`,
      ).toBe(true);
      if (!meta.ogImage) {
        expect(
          meta.ogCard?.title,
          `${slug}: pages with a generated og image need ogCard text so "npm run generate:og" can rebuild it`,
        ).toBeTruthy();
      }
    });
  });

  it("has no orphan pages.json entries (catches page renames)", () => {
    const slugs = new Set(allPages.map((p) => p.replace(/\.html$/, "")));
    const orphans = Object.keys(pagesJson).filter((slug) => !slugs.has(slug));
    expect(
      orphans,
      "pages.json entries without a matching root .html file. On rename: update the key, add a vercel.json redirect, and regenerate the og image.",
    ).toEqual([]);
  });

  it("has no orphan og images (catches page renames)", () => {
    const referenced = new Set();
    for (const [slug, meta] of Object.entries(pagesJson)) {
      if (meta.og === false) continue;
      referenced.add(
        meta.ogImage ? path.basename(meta.ogImage) : `${slug}.png`,
      );
    }
    const onDisk = fs
      .readdirSync(path.join(rootDir, "assets", "og"))
      .filter((f) => f.endsWith(".png"));
    const orphans = onDisk.filter((f) => !referenced.has(f));
    expect(
      orphans,
      "assets/og/ png files no longer referenced by any pages.json entry; delete them",
    ).toEqual([]);
  });

  // noindex and sitemap inclusion must not contradict each other.
  it("keeps noindex pages out of the sitemap", () => {
    const conflicts = Object.entries(pagesJson)
      .filter(([, m]) => /noindex/i.test(m.robots ?? "") && m.sitemap !== false)
      .map(([slug]) => slug);
    expect(
      conflicts,
      'pages marked robots "noindex" must also set "sitemap": false (mixed crawl signals)',
    ).toEqual([]);
  });
});

// OG images must be exactly 1200x630 or social previews render cropped.
describe("OG images have correct dimensions", () => {
  const ogImages = glob.sync("assets/og/**/*.png", { cwd: rootDir });

  it("finds OG images", () => {
    expect(ogImages.length).toBeGreaterThan(0);
  });

  it.each(ogImages)("%s is 1200x630", async (image) => {
    const { width, height } = await sharp(path.join(rootDir, image)).metadata();
    expect(
      `${width}x${height}`,
      `${image} must be 1200x630 for social cards. Regenerate with "npm run generate:og".`,
    ).toBe("1200x630");
  });
});
