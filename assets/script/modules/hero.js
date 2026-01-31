import { gsap } from 'gsap';

// Hero Section ========================
export function initHeroAnimation() {

    const heroHeading = document.getElementById('heroHeading');
    const heroDec = document.getElementById('heroDec');
    const heroBtn = document.getElementById('heroBtn');

    if (!heroHeading && !heroDec && !heroBtn) return;

    const heroTl = gsap.timeline();
    heroTl.from('#heroHeading, #heroDec', {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: 'linear',
        stagger: 0.3
    }, 'hero')
        .from('#heroBtn', {
            y: 50,
            scale: 0,
            opacity: 0,
            duration: 0.5
        }, 'hero+=0.3');
}
