import 'swiper/css';
import 'swiper/css/navigation';
import 'lenis/dist/lenis.css';

import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initHeader } from './modules/header.js';
import { initDropdowns } from './modules/dropdown.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initRippleEffect } from './modules/ripple.js';
import { initSwipers } from './modules/swiper-sliders.js';
import { initCounters } from './modules/counter.js';
import { initScrollAnimations } from './modules/animations.js';
import { initCursorEffects } from './modules/cursor.js';
import { initHeroAnimation } from './modules/hero.js';
import { initFooterEffects } from './modules/footer.js';
import { initMultiSelect } from './modules/multi-select.js';

document.addEventListener('DOMContentLoaded', () => {
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
});

// Multi-select runs immediately (outside DOMContentLoaded)
initMultiSelect();