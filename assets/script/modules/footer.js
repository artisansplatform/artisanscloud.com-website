import { gsap } from 'gsap';

// Footer Artisans Text =============
export function initFooterEffects() {

    const ftrTitles = document.querySelectorAll(".ftrBottomTitle");
    if (!ftrTitles.length) return;

    ftrTitles.forEach(title => {

        title.addEventListener("mouseenter", () => {
            gsap.set(title, {
                backgroundImage: `
                    url('assets/image/logo-icon.svg'),
                    linear-gradient(93.32deg, #D9CCFF 1.4%, #A1EFF5 101.99%)
                `,
                backgroundRepeat: "no-repeat, no-repeat",
                backgroundSize: "140px 140px, 100% 100%",
                backgroundPosition: "50% 50%, 50% 50%",
            });
        });

        title.addEventListener("mousemove", (e) => {
            const rect = title.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            gsap.to(title, {
                backgroundPosition: `${x}% ${y}%, 50% 50%`,
                duration: 0.2,
                ease: "none",
            });
        });

        title.addEventListener("mouseleave", () => {
            gsap.set(title, {
                backgroundImage: `
                    linear-gradient(93.32deg, #D9CCFF 1.4%, #A1EFF5 101.99%)
                `,
                backgroundPosition: "50% 50%",
                backgroundSize: "100% 100%",
            });
        });
    });
}
