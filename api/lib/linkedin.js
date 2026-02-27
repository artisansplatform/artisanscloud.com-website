import { put, list } from '@vercel/blob';

const LINKEDIN_API_BASE = 'https://api.linkedin.com';
const TOKEN_BLOB_KEY = 'token-meta.json';

/**
 * Read stored token metadata from Vercel Blob.
 * Returns { accessToken, refreshToken, expiresAt } or null.
 */
async function readTokenMeta() {
  try {
    const { blobs } = await list({ prefix: TOKEN_BLOB_KEY });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Persist updated token metadata to Vercel Blob.
 */
async function writeTokenMeta(meta) {
  await put(TOKEN_BLOB_KEY, JSON.stringify(meta), {
    access: 'public',
    addRandomSuffix: false,
  });
}

/**
 * Refresh the LinkedIn access token using the refresh token.
 * Stores the new token in Blob and returns it.
 */
async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
  });

  const res = await fetch(`${LINKEDIN_API_BASE}/oauth/v2/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const meta = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  await writeTokenMeta(meta);
  console.log('LinkedIn access token refreshed and stored in Blob');
  return meta.accessToken;
}

/**
 * Get a valid access token. Checks Blob first, falls back to env var,
 * and auto-refreshes if expired.
 */
export async function getValidAccessToken() {
  const meta = await readTokenMeta();

  if (meta && meta.accessToken) {
    // If token is not expired (with 5 min buffer), use it
    if (meta.expiresAt && Date.now() < meta.expiresAt - 5 * 60 * 1000) {
      return meta.accessToken;
    }
    // Try to refresh
    if (meta.refreshToken) {
      try {
        return await refreshAccessToken(meta.refreshToken);
      } catch (err) {
        console.warn('Token refresh from Blob meta failed:', err.message);
      }
    }
  }

  // Fall back to env var
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!envToken) {
    throw new Error('No LinkedIn access token available');
  }
  return envToken;
}

/**
 * Fetch LinkedIn articles for the configured organization.
 * Uses the DMA OriginalArticles API (FindByAuthor) which works with
 * the r_dma_admin_pages_content scope from the Pages Data Portability product.
 * Returns a normalized array of article objects.
 */
export async function fetchLinkedInArticles(accessToken) {
  const orgId = process.env.LINKEDIN_ORG_ID;
  if (!orgId) throw new Error('LINKEDIN_ORG_ID not configured');

  const authorUrn = encodeURIComponent(`urn:li:organization:${orgId}`);
  const url = `${LINKEDIN_API_BASE}/rest/dmaOriginalArticles?q=author&author=${authorUrn}&start=0&count=50&state=(value:PUBLISHED)`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': '202601',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (res.status === 401) {
    // Token expired — try refresh from env
    const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;
    if (refreshToken) {
      console.warn('Access token expired, attempting refresh...');
      const newToken = await refreshAccessToken(refreshToken);
      return fetchLinkedInArticles(newToken);
    }
    throw new Error('LinkedIn access token expired and no refresh token available');
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const articles = data.elements || [];

  // Normalize DMA OriginalArticles response to our standard format
  return articles
    .filter((article) => article.state === 'PUBLISHED')
    .map((article) => {
      // Build the LinkedIn article URL from the permlink
      const articleUrl = article.permlink
        ? `https://www.linkedin.com/pulse/${article.permlink}`
        : '';

      // Extract thumbnail from coverImage or displayImage
      const thumbnail =
        (article.coverImage && article.coverImage.originalImage && article.coverImage.originalImage.downloadUrl) ||
        (article.displayImage && article.displayImage.downloadUrl) ||
        null;

      // Extract a description from contentHtml (strip tags, take first ~200 chars)
      const description = extractDescription(article.contentHtml || '', article.title || '');

      return {
        id: article.linkedInArticleUrn || '',
        title: article.title || '',
        description,
        url: articleUrl,
        thumbnail,
        publishedAt: article.publishedAt || article.createdAt || Date.now(),
        category: extractCategory(article.title || ''),
      };
    })
    .sort((a, b) => b.publishedAt - a.publishedAt);
}

/**
 * Extract a plain-text description from article HTML content.
 * Strips tags and returns the first ~200 characters.
 */
function extractDescription(html, title) {
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  // Skip if it's just the title repeated
  const cleaned = text.startsWith(title) ? text.slice(title.length).trim() : text;
  if (!cleaned) return '';
  return cleaned.length > 200 ? cleaned.slice(0, 200) + '...' : cleaned;
}

/**
 * Simple category extraction from article title keywords.
 */
function extractCategory(title) {
  const lower = title.toLowerCase();
  const categories = [
    { keywords: ['pos', 'point of sale'], label: 'Retail POS' },
    { keywords: ['assortment'], label: 'Assortment Planning' },
    { keywords: ['merchandise transfer', 'inventory'], label: 'Merchandise Planning' },
    { keywords: ['product lifecycle'], label: 'Retail Product Lifecycle' },
    { keywords: ['data analytics', 'data lake'], label: 'Data Analytics' },
    { keywords: ['merchandise financial', 'financial planning'], label: 'Merchandise Planning' },
    { keywords: ['demand forecast'], label: 'Demand Forecasting' },
    { keywords: ['markdown', 'price'], label: 'Price Markdown Optimization' },
    { keywords: ['basket analysis'], label: 'Basket Analysis' },
    { keywords: ['retail technology', 'retail trend'], label: 'Retail Technology' },
    { keywords: ['retail-as-a-service', 'raas'], label: 'Retail Innovation' },
    { keywords: ['ai', 'artificial intelligence', 'machine learning'], label: 'AI & Analytics' },
    { keywords: ['supply chain'], label: 'Supply Chain' },
    { keywords: ['ecommerce', 'e-commerce', 'd2c'], label: 'eCommerce' },
    { keywords: ['customer experience', 'cem'], label: 'Customer Experience' },
  ];

  for (const cat of categories) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.label;
    }
  }
  return 'Retail Insights';
}
