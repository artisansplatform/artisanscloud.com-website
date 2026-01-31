// Counter ========================
export function initCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = +counter.dataset.target || +counter.innerText;
            const duration = 1500;
            const startTime = performance.now();

            const animate = (time) => {
                const progress = Math.min((time - startTime) / duration, 1);
                counter.innerText = Math.floor(progress * target);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.innerText = target;
                }
            };

            requestAnimationFrame(animate);
            observer.unobserve(counter);
        });
    }, { threshold: 0.3 });

    counters.forEach(counter => observer.observe(counter));
}
