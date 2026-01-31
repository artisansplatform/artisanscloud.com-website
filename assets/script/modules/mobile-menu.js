// Mobile Menu Functionality ============================
export function initMobileMenu() {
    const nav = document.getElementById("mainNav");
    const menuToggle = document.getElementById("menuToggle");
    const closeBtn = document.getElementById("menuClose");
    const overlay = document.getElementById("menuOverlay");

    const mqLg = window.matchMedia("(min-width: 1024px)");

    if (nav && menuToggle && overlay) {
        const openMenu = () => {
            nav.classList.remove("translate-x-full");
            overlay.classList.remove("opacity-0", "invisible");
            document.body.classList.add("overflow-hidden");
        };

        const closeMenu = () => {
            nav.classList.add("translate-x-full");
            overlay.classList.add("opacity-0", "invisible");
            document.body.classList.remove("overflow-hidden");
        };

        menuToggle.addEventListener("click", openMenu);
        closeBtn?.addEventListener("click", closeMenu);
        overlay.addEventListener("click", closeMenu);

        const handleBreakpoint = (e) => {
            if (e.matches) {
                overlay.classList.add("opacity-0", "invisible");
                nav.classList.remove("translate-x-full");
                document.body.classList.remove("overflow-hidden");
            } else {
                nav.classList.add("translate-x-full");
            }
        };

        handleBreakpoint(mqLg);
        mqLg.addEventListener("change", handleBreakpoint);
    }
}
