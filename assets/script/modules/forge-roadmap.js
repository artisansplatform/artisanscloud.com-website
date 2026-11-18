// Flip toggle for the roadmap cards (.rd .fc) on quality-management-system.
// No-ops on pages without them.
export function initForgeRoadmap() {
  document.querySelectorAll(".rd .fc").forEach((card) => {
    const toggle = () =>
      card.setAttribute("aria-pressed", card.classList.toggle("flip"));
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}
