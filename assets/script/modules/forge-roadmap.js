// Flip toggle for the roadmap cards (.rd .fc) on quality-management-system.
// Each card holds a real <button class="fc-toggle">, so keyboard and screen
// reader support come from the browser. No-ops on pages without them.
export function initForgeRoadmap() {
  document.querySelectorAll(".rd .fc").forEach((card) => {
    const btn = card.querySelector(".fc-toggle");
    btn?.addEventListener("click", () =>
      btn.setAttribute("aria-pressed", card.classList.toggle("flip")),
    );
  });
}
