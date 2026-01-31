// Header ============================
export function initHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        const currentScroll = window.scrollY;
        if (currentScroll > 20) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });
}
