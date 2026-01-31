// Smooth Scrolling (Lenis) ========================
export function initSmoothScroll() {
    if (typeof Lenis === "undefined") return;
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
