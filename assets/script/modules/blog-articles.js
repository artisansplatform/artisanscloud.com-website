/**
 * Dynamic blog articles module.
 *
 * Single source of truth for blog card rendering:
 * - Card HTML templates live ONLY in this file (not duplicated in HTML pages)
 * - Fallback article data lives in /assets/data/fallback-articles.json
 *   (shared by this module and the API backend, one file, zero duplication)
 * - On page load: renders fallback data immediately from the bundled JSON
 * - Then fetches /api/articles and upgrades to live LinkedIn data if available
 *
 * To update card design, edit THIS file.
 * To update fallback articles, edit assets/data/fallback-articles.json.
 */

import fallbackArticles from '../../data/fallback-articles.json';
import localArticles from '../../data/local-articles.json';

const FALLBACK_IMAGE = '/assets/image/insightsLeadership-card-1.png';
const ARTICLES_PER_PAGE = 9;

let visibleCount = ARTICLES_PER_PAGE;
let currentArticles = [];

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function createBlogCardHTML(article) {
  const thumbnail = article.thumbnail || FALLBACK_IMAGE;
  const safeTitle = escapeHTML(article.title);
  const safeDescription = escapeHTML(article.description);
  const safeTags = (article.tags || [article.category || 'Retail']).map(escapeHTML);
  const safeUrl = escapeHTML(article.url);
  const dateStr = formatDate(article.publishedAt);
  const isLocal = article.source === 'local';
  // Local articles link internally; LinkedIn articles open in a new tab
  const linkTarget = isLocal ? '' : ' target="_blank" rel="noopener noreferrer"';
  const ariaLabel = isLocal
    ? `Read ${safeTitle}`
    : `Read ${safeTitle} on LinkedIn`;

  return `<div class="fade-in p-2.5 border border-[#f2f2f2] rounded-xl sm:rounded-[20px] h-full group">
    <a href="${safeUrl}"${linkTarget} aria-label="${ariaLabel}" class="block w-full aspect-video overflow-hidden rounded-xl">
        <img src="${escapeHTML(thumbnail)}" alt="${safeTitle} blog post image" width="400" height="250" loading="lazy" class="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 ease-in-out" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
    </a>
    <div class="pt-4 sm:pt-[22px] px-[14px] pb-2.5">
        <div class="mb-2.5 sm:mb-3.5 flex flex-wrap gap-2 items-center">
            ${safeTags.map(tag => `<div class="px-2.5 py-0.5 rounded-[50px] text-center w-fit h-fit bg-[#F5EEFE] text-[#9F7EFF] font-primary font-medium sm:text-base text-sm">${tag}</div>`).join('')}
            <div class="relative ps-3 text-description/70 lg:text-base text-sm font-normal font-primary"><div class="absolute top-2.5 start-0 bg-description/70 h-1 w-1 rounded-full"></div>${dateStr}</div>
        </div>
        <a href="${safeUrl}"${linkTarget} class="mb-2 block line-clamp-1 text-heading font-primary font-semibold sm:text-[22px] text-xl leading-[110%] hover:underline">${safeTitle}</a>
        <div class="flex flex-wrap sm:flex-nowrap gap-4 md:items-end">
            <p class="line-clamp-2 text-description font-primary font-normal leading-[150%]">${safeDescription}</p>
            <a href="${safeUrl}"${linkTarget} class="max-w-10 min-w-10 sm:max-w-[50px] sm:min-w-[50px] h-10 sm:h-[50px] grid place-items-center border border-[#d8d8d8] rounded-full text-heading hover:bg-heading hover:text-white focus-visible:bg-heading focus-visible:text-white group" aria-label="${ariaLabel}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-all duration-300 ease-in-out group-hover:rotate-45">
                    <g clip-path="url(#clip0_72_2743)">
                        <path d="M8 16L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9 8H16V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                </svg>
            </a>
        </div>
    </div>
</div>`;
}

function createInsightsCardHTML(article) {
  const thumbnail = article.thumbnail || FALLBACK_IMAGE;
  const safeTitle = escapeHTML(article.title);
  const safeDescription = escapeHTML(article.description);
  const safeTags = (article.tags || [article.category || 'Retail']).map(escapeHTML);
  const safeUrl = escapeHTML(article.url);
  const dateStr = formatDate(article.publishedAt);

  return `<div class="fade-in p-2.5 border border-[#f2f2f2] rounded-xl sm:rounded-[20px] h-full group">
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" aria-label="Read ${safeTitle} on LinkedIn" class="block w-full aspect-video overflow-hidden rounded-xl">
        <img src="${escapeHTML(thumbnail)}" alt="${safeTitle}" class="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 ease-in-out" width="400" height="225" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
    </a>
    <div class="pt-4 sm:pt-[22px] px-[14px] pb-2.5">
        <div class="mb-2.5 sm:mb-3.5 flex flex-wrap gap-2 items-center">
            ${safeTags.map(tag => `<div class="px-2.5 py-0.5 rounded-[50px] text-center w-fit h-fit bg-[#F5EEFE] text-[#9F7EFF] font-primary font-medium sm:text-base text-sm">${tag}</div>`).join('')}
            <div class="relative ps-3 text-description/70 lg:text-base text-sm font-normal font-primary"><div class="absolute top-2.5 start-0 bg-description/70 h-1 w-1 rounded-full"></div>${dateStr}</div>
        </div>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="mb-3 block text-heading font-primary font-semibold sm:text-[22px] text-xl leading-[110%] hover:underline">${safeTitle}</a>
        <div class="flex flex-wrap sm:flex-nowrap gap-4 md:items-end">
            <p class="line-clamp-3 text-description font-primary font-normal leading-[150%]">${safeDescription}</p>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="max-w-10 min-w-10 sm:max-w-[50px] sm:min-w-[50px] aspect-square grid place-items-center border border-[#d8d8d8] rounded-full text-heading hover:bg-heading hover:text-white focus-visible:bg-heading focus-visible:text-white group" aria-label="Read ${safeTitle} on LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-all duration-300 ease-in-out group-hover:rotate-45">
                    <g clip-path="url(#clip0_72_2743)">
                        <path d="M8 16L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9 8H16V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                </svg>
            </a>
        </div>
    </div>
</div>`;
}

function updateLoadMoreBtn(articles) {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;
  btn.style.display = visibleCount < articles.length ? '' : 'none';
}

function renderBlogGrid(articles, blogGrid) {
  blogGrid.innerHTML = articles.slice(0, visibleCount).map(createBlogCardHTML).join('');
  updateLoadMoreBtn(articles);
}

function renderArticles(articles, blogGrid, insightsGrid) {
  currentArticles = articles;
  if (blogGrid) {
    renderBlogGrid(articles, blogGrid);
  }
  if (insightsGrid) {
    insightsGrid.innerHTML = articles.slice(0, 3).map(createInsightsCardHTML).join('');
  }
}

/**
 * Merge local (static blog) and remote (LinkedIn/API) articles.
 * Local articles come first (sorted by date descending), then remote.
 * Deduplication is not needed since local articles have source: 'local'
 * and remote articles are LinkedIn posts with external URLs.
 */
function mergeArticles(remoteArticles) {
  // Sort local articles by date descending
  const sortedLocal = [...localArticles].sort((a, b) => {
    const da = new Date(a.publishedAt).getTime() || 0;
    const db = new Date(b.publishedAt).getTime() || 0;
    return db - da;
  });
  return [...sortedLocal, ...remoteArticles];
}

export function initBlogArticles() {
  const blogGrid = document.getElementById('blog-grid');
  const insightsGrid = document.getElementById('insights-grid');

  if (!blogGrid && !insightsGrid) return;

  // Render merged local + fallback data immediately (no network needed)
  const initialArticles = mergeArticles(fallbackArticles);
  renderArticles(initialArticles, blogGrid, insightsGrid);

  // Wire up Load More button
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn && blogGrid) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += ARTICLES_PER_PAGE;
      renderBlogGrid(currentArticles, blogGrid);
    });
  }

  // Then try to upgrade with live API data (LinkedIn posts)
  fetch('/api/articles')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((remoteArticles) => {
      if (Array.isArray(remoteArticles) && remoteArticles.length > 0) {
        renderArticles(mergeArticles(remoteArticles), blogGrid, insightsGrid);
      }
    })
    .catch((err) => {
      // Fallback data already rendered, nothing to do
      console.warn('Failed to load dynamic blog articles:', err.message);
    });
}
