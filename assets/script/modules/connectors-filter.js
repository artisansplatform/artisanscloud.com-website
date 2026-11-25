// Text filter for the connectors grid. No-ops without #connectorsGrid.
export function initConnectorsFilter() {
  const grid = document.getElementById("connectorsGrid");
  if (!grid) return;

  const search = document.getElementById("connectorsSearch");
  const empty = document.getElementById("connectorsEmpty");
  const cards = [...grid.children];

  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const ok = card.dataset.name.includes(q);
      card.classList.toggle("hidden", !ok);
      if (ok) shown++;
    });
    empty.classList.toggle("hidden", shown > 0);
  };

  search.addEventListener("input", apply);
  // Enter in the search box must not submit the form.
  document
    .getElementById("connectorsFilter")
    .addEventListener("submit", (e) => e.preventDefault());
}
