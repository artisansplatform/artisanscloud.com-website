import Lenis from 'lenis';

// Smooth Scrolling (Lenis) ========================
export function initSmoothScroll() {
    const lenis = new Lenis({
        smooth: true,
        lerp: 0.08,
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}
