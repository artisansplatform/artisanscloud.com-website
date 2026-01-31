// Button Ripple Effect ========================
export function initRippleEffect() {
    const buttons = document.querySelectorAll(".btn");
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const ripple = document.createElement("span");
            ripple.className = "ripple";
            const size = Math.max(btn.offsetWidth, btn.offsetHeight);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.offsetX - size / 2}px`;
            ripple.style.top = `${e.offsetY - size / 2}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}
