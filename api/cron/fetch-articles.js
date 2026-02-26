import { put, list } from '@vercel/blob';
import { getValidAccessToken, fetchLinkedInArticles } from '../lib/linkedin.js';

const ARTICLES_BLOB_KEY = 'articles.json';

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

    // Store in Vercel Blob
    await put(ARTICLES_BLOB_KEY, JSON.stringify(articles), {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log(`Stored ${articles.length} articles in Blob`);
    return res.status(200).json({
      message: 'Articles fetched and cached',
      count: articles.length,
    });
  } catch (err) {
    console.error('Cron fetch-articles error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
