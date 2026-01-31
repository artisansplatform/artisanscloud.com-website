import { gsap } from 'gsap';

// Cursor Effects (Reusable) ========================
export function initCursorEffects() {
    const cursor = document.getElementById("cursor");
    if (!cursor) return;

    function attachCursorEffect(el, bg, scale = 1) {
        if (!el) return;

        el.addEventListener("mousemove", (e) => {
            gsap.to(cursor, {
                x: e.x,
                y: e.y,
                xPercent: -50,
                yPercent: -50,
                duration: 0.3,
                background: bg,
            });
        });

        el.addEventListener("mouseenter", () => {
            gsap.to(cursor, {
                scale,
                opacity: 1,
                duration: 0.3,
            });
        });

        el.addEventListener("mouseleave", () => {
            gsap.to(cursor, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
            });
        });
    }

    // Sections ==================================
    attachCursorEffect(
        document.querySelector(".CTA_sec"),
        "#ffffff8b",
        1
    );
    attachCursorEffect(
        document.querySelector(".impactFrameworkCTA"),
        "#ffffff8b",
        1
    );

    attachCursorEffect(
        document.querySelector(".strategicOutcomeBanner_sec"),
        "#dadada8b",
        1
    );

    attachCursorEffect(
        document.querySelector(".strategicImpact_sec .leftCard"),
        "#f9d0f2ff",
        1
    );

    attachCursorEffect(
        document.querySelector(".gridGradientCard"),
        "#f9d0f2aa",
        1
    );

    document.querySelectorAll(".ftrGetStartCard").forEach(card => {
        attachCursorEffect(card, "#f9d0f2ff", 0.5);
    });
}
