// element enter animation effect ========================
export function initScrollAnimations() {
    if (typeof gsap === "undefined") return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray('.fade-in').forEach((el) => {
            gsap.from(el, {
                y: 50,
                opacity: 0,
                duration: 0.5,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    end: 'top 85%',
                    toggleActions: 'play none none none',
                },
            });
        });
    });
    mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray('.fade-in').forEach((el) => {
            gsap.from(el, {
                y: 30,
                opacity: 0,
                duration: 0.4,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 95%',
                    end: 'top 90%',
                    toggleActions: 'play none none none',
                },
            });
        });
    });
}
