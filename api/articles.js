import { list } from "@vercel/blob";
import { fallbackArticles } from "./lib/fallback-articles.js";

const ARTICLES_BLOB_KEY = "articles.json";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: ARTICLES_BLOB_KEY });

    if (blobs.length > 0) {
      const blobRes = await fetch(blobs[0].url);
      if (blobRes.ok) {
        const articles = await blobRes.json();
        res.setHeader(
          "Cache-Control",
          "public, s-maxage=3600, stale-while-revalidate=86400",
        );
        return res.status(200).json(articles);
      }
    }

    // Blob empty or unavailable, return fallback
    console.warn("No cached articles in Blob, returning fallback");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600",
    );
    return res.status(200).json(fallbackArticles);
  } catch (err) {
    console.error("Error reading articles from Blob:", err.message);
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600",
    );
    return res.status(200).json(fallbackArticles);
  }
}
