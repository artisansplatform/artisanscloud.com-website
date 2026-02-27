import { put } from '@vercel/blob';
import { getValidAccessToken, fetchLinkedInArticles } from '../lib/linkedin.js';

const ARTICLES_BLOB_KEY = 'articles.json';

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

async function downloadAndStoreImage(imageUrl, slug) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);

  const contentType = res.headers.get('content-type') || '';
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';

  const buffer = Buffer.from(await res.arrayBuffer());
  const { url } = await put(`images/${slug}.${ext}`, buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType,
  });

  return url;
}

export default async function handler(req, res) {
  // Verify cron secret — Vercel sends this automatically for cron triggers
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const accessToken = await getValidAccessToken();
    const articles = await fetchLinkedInArticles(accessToken);

    // If fetch returns 0 articles, keep existing cache untouched
    if (articles.length === 0) {
      console.warn('LinkedIn returned 0 articles — keeping existing cache');
      return res.status(200).json({
        message: 'No articles returned, cache unchanged',
        count: 0,
      });
    }

    // Download thumbnails to Vercel Blob, replacing external LinkedIn URLs
    const articlesWithImages = await Promise.all(
      articles.map(async (article) => {
        if (!article.thumbnail) return article;
        try {
          const slug = slugify(article.title) || String(article.id);
          const blobUrl = await downloadAndStoreImage(article.thumbnail, slug);
          return { ...article, thumbnail: blobUrl };
        } catch (err) {
          console.warn(`Failed to download image for "${article.title}":`, err.message);
          return article; // keep original URL as fallback
        }
      })
    );

    // Store in Vercel Blob
    await put(ARTICLES_BLOB_KEY, JSON.stringify(articlesWithImages), {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log(`Stored ${articlesWithImages.length} articles in Blob`);
    return res.status(200).json({
      message: 'Articles fetched and cached',
      count: articlesWithImages.length,
    });
  } catch (err) {
    console.error('Cron fetch-articles error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
