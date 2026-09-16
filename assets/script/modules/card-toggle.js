// Progressive "View More / View Less" toggle for long card grids.
// Activates only on pages that have a #toggleCards button (currently
// d2c-ecommerce); shows the first `visibleCount` .feature-card items and
// toggles the rest. No-ops everywhere else.
export function initCardToggle() {
  const toggleBtn = document.getElementById("toggleCards");
  if (!toggleBtn) return;

  const cards = document.querySelectorAll(".feature-card");
  const visibleCount = 6;

  cards.forEach((card, index) => {
    if (index >= visibleCount) card.classList.add("hidden");
  });

  toggleBtn.addEventListener("click", () => {
    const isExpanded = toggleBtn.textContent.trim() === "View Less";
    cards.forEach((card, index) => {
      if (index >= visibleCount) card.classList.toggle("hidden", isExpanded);
    });
    toggleBtn.textContent = isExpanded ? "View More" : "View Less";
  });
}
