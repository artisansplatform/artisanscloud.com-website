/**
 * Dynamic blog articles module.
 *
 * Single source of truth for blog card rendering:
 * - Card HTML templates live ONLY in this file (not duplicated in HTML pages)
 * - Fallback article data lives in /assets/data/fallback-articles.json
 *   (shared by this module and the API backend — one file, zero duplication)
 * - On page load: renders fallback data immediately from the bundled JSON
 * - Then fetches /api/articles and upgrades to live LinkedIn data if available
 *
 * To update card design, edit THIS file.
 * To update fallback articles, edit assets/data/fallback-articles.json.
 */

import fallbackArticles from '../../data/fallback-articles.json';

const FALLBACK_IMAGE = '/assets/image/insightsLeadership-card-1.png';

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
  const safeCategory = escapeHTML(article.category || 'Retail Insights');
  const safeUrl = escapeHTML(article.url);
  const dateStr = formatDate(article.publishedAt);

  return `<div class="fade-in p-2.5 border border-[#f2f2f2] rounded-xl sm:rounded-[20px] h-full group">
    <div class="w-full aspect-video overflow-hidden rounded-xl">
        <img src="${escapeHTML(thumbnail)}" alt="${safeTitle} blog post image" width="400" height="250" loading="lazy" class="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 ease-in-out" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
    </div>
    <div class="pt-4 sm:pt-[22px] px-[14px] pb-2.5">
        <div class="mb-2.5 sm:mb-3.5 flex flex-wrap gap-2 items-center">
            <div class="px-2.5 py-0.5 rounded-[50px] text-center w-fit h-fit bg-[#F5EEFE] text-[#9F7EFF] font-primary font-medium sm:text-base text-sm">${safeCategory}</div>
            <div class="relative ps-3 text-description/70 lg:text-base text-sm font-normal font-primary"><div class="absolute top-2.5 start-0 bg-description/70 h-1 w-1 rounded-full"></div>${dateStr}</div>
        </div>
        <div class="mb-2 line-clamp-1 text-heading font-primary font-semibold sm:text-[22px] text-xl leading-[110%]">${safeTitle}</div>
        <div class="flex flex-wrap sm:flex-nowrap gap-4 md:items-end">
            <p class="line-clamp-2 text-description font-primary font-normal leading-[150%]">${safeDescription}</p>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="max-w-10 min-w-10 sm:max-w-[50px] sm:min-w-[50px] h-10 sm:h-[50px] grid place-items-center border border-[#d8d8d8] rounded-full text-heading hover:bg-heading hover:text-white focus-visible:bg-heading focus-visible:text-white group" aria-label="Read ${safeTitle} on LinkedIn">
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
  const safeUrl = escapeHTML(article.url);

  return `<div class="fade-in p-2.5 border border-[#f2f2f2] rounded-xl sm:rounded-[20px] h-full group">
    <div class="w-full aspect-video overflow-hidden rounded-xl">
        <img src="${escapeHTML(thumbnail)}" alt="${safeTitle}" class="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 ease-in-out" width="400" height="225" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
    </div>
    <div class="pt-4 sm:pt-[22px] px-[14px] pb-2.5">
        <div class="text-heading font-primary font-semibold sm:text-[22px] text-xl leading-[110%] mb-3">${safeTitle}</div>
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

function renderArticles(articles, blogGrid, insightsGrid) {
  if (blogGrid) {
    blogGrid.innerHTML = articles.map(createBlogCardHTML).join('');
  }
  if (insightsGrid) {
    insightsGrid.innerHTML = articles.slice(0, 3).map(createInsightsCardHTML).join('');
  }
}

export function initBlogArticles() {
  const blogGrid = document.getElementById('blog-grid');
  const insightsGrid = document.getElementById('insights-grid');

  if (!blogGrid && !insightsGrid) return;

  // Render fallback data immediately — bundled at build time, no network request
  renderArticles(fallbackArticles, blogGrid, insightsGrid);

  // Then try to upgrade with live API data
  fetch('/api/articles')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((articles) => {
      if (Array.isArray(articles) && articles.length > 0) {
        renderArticles(articles, blogGrid, insightsGrid);
      }
    })
    .catch((err) => {
      // Fallback data already rendered — nothing to do
      console.warn('Failed to load dynamic blog articles:', err.message);
    });
}
