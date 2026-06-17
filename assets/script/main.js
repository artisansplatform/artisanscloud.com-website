import "swiper/css";
import "lenis/dist/lenis.css";

import { initSmoothScroll } from "./modules/smooth-scroll.js";
import { initHeader } from "./modules/header.js";
import { initDropdowns } from "./modules/dropdown.js";
import { initMobileMenu } from "./modules/mobile-menu.js";
import { initRippleEffect } from "./modules/ripple.js";
import { initSwipers } from "./modules/swiper-sliders.js";
import { initCounters } from "./modules/counter.js";
import { initScrollAnimations } from "./modules/animations.js";
import { initCursorEffects } from "./modules/cursor.js";
import { initHeroAnimation } from "./modules/hero.js";
import { initFooterEffects } from "./modules/footer.js";
import { initMultiSelect } from "./modules/multi-select.js";
import { initTabs } from "./modules/tabs.js";
import { initCardToggle } from "./modules/card-toggle.js";
import { initNavActive } from "./modules/nav-active.js";
import { initBlogArticles } from "./modules/blog-articles.js";
import { initDigitalCard } from "./modules/digital-card.js";
import { initVercelAnalytics } from "./modules/vercel-analytics.js";
import { initLinkedInInsight } from "./modules/linkedin-insight.js";
import { initUmami } from "./modules/umami.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavActive();
  initBlogArticles();
  initDigitalCard();
  initSmoothScroll();
  initHeader();
  initDropdowns();
  initMobileMenu();
  initRippleEffect();
  initSwipers();
  initCounters();
  initScrollAnimations();
  initCursorEffects();
  initHeroAnimation();
  initFooterEffects();
  initTabs();
  initCardToggle();
  initVercelAnalytics();
  initLinkedInInsight();
  initUmami();
});

// Multi-select runs immediately (outside DOMContentLoaded)
initMultiSelect();
