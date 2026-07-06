import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import fallbackArticles from '../../data/fallback-articles.json';
import localArticles from '../../data/local-articles.json';

const FALLBACK_IMAGE = '/assets/image/insightsLeadership-card-1.png';

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function createSlide(article) {
  const thumbnail = article.thumbnail || FALLBACK_IMAGE;
  const safeTitle = escapeHTML(article.title);
  const safeDescription = escapeHTML(article.description);
  const safeUrl = escapeHTML(article.url);
  const isLocal = article.source === 'local';
  const linkTarget = isLocal ? '' : ' target="_blank" rel="noopener noreferrer"';

  return `<div class="swiper-slide !h-auto">
  <div class="fade-in p-2.5 border border-[#f2f2f2] rounded-xl sm:rounded-[20px] h-full group">
    <a href="${safeUrl}"${linkTarget} class="block w-full aspect-video overflow-hidden rounded-xl">
      <img src="${escapeHTML(thumbnail)}" alt="${safeTitle}" width="400" height="250" loading="lazy" class="h-full w-full object-cover group-hover:scale-105 transition-all duration-300 ease-in-out" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
    </a>
    <div class="pt-4 sm:pt-[22px] px-[14px] pb-2.5">
      <a href="${safeUrl}"${linkTarget} class="block text-heading font-primary font-semibold sm:text-[22px] text-xl leading-[110%] mb-3 hover:underline">${safeTitle}</a>
      <div class="flex flex-wrap sm:flex-nowrap gap-4 md:items-end">
        <p class="line-clamp-3 text-description font-primary font-normal leading-[150%]">${safeDescription}</p>
        <a href="${safeUrl}"${linkTarget} class="max-w-10 min-w-10 sm:max-w-[50px] sm:min-w-[50px] h-10 sm:h-[50px] grid place-items-center border border-[#d8d8d8] rounded-full text-heading hover:bg-heading hover:text-white focus-visible:bg-heading focus-visible:text-white group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-all duration-300 ease-in-out group-hover:rotate-45">
            <g clip-path="url(#clip0_72_2743)">
              <path d="M8 16L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 8H16V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </a>
      </div>
    </div>
  </div>
</div>`;
}

export function initLatestInsights() {
  const grid = document.getElementById('latest-insights-grid');
  if (!grid) return;

  const currentUrl = grid.dataset.currentUrl || '';

  const sortedLocal = [...localArticles].sort((a, b) => {
    const da = new Date(a.publishedAt).getTime() || 0;
    const db = new Date(b.publishedAt).getTime() || 0;
    return db - da;
  });

  const candidates = [...sortedLocal, ...fallbackArticles].filter(a => a.url !== currentUrl);
  if (candidates.length === 0) return;

  grid.innerHTML = candidates.slice(0, 6).map(createSlide).join('');

  new Swiper('.latestInsightsSlider', {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 10 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 20 },
    },
    navigation: {
      nextEl: '.swiper-button-next-latestInsightsSlider',
      prevEl: '.swiper-button-prev-latestInsightsSlider',
    },
  });
}
