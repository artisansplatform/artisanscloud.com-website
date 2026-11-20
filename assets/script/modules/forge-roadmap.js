// Flip toggle for the roadmap cards (.rd .fc) on quality-management-system.
// Each card holds a real <button class="fc-toggle">, so keyboard and screen
// reader support come from the browser. Cards also flip on their own every
// AUTO_MS, staggered left to right. Auto flip pauses while the grid is hovered
// or focused, offscreen, or the tab is hidden, and is off for reduced motion.
// No-ops on pages without them.
const AUTO_MS = 4000;
const STAGGER_MS = 150;

export function initForgeRoadmap() {
  const grid = document.querySelector(".rd .grid");
  const cards = [...document.querySelectorAll(".rd .fc")];
  if (!grid) return;

  const flip = (card, on) => {
    card.classList.toggle("flip", on);
    card.querySelector(".fc-toggle")?.setAttribute("aria-pressed", on);
  };

  cards.forEach((card) => {
    card
      .querySelector(".fc-toggle")
      ?.addEventListener("click", () =>
        flip(card, !card.classList.contains("flip")),
      );
  });

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let paused = false;
  let visible = false;
  let showBack = true;
  const pause = (v) => () => (paused = v);
  grid.addEventListener("pointerenter", pause(true));
  grid.addEventListener("pointerleave", pause(false));
  grid.addEventListener("focusin", pause(true));
  grid.addEventListener("focusout", pause(false));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(grid);

  setInterval(() => {
    if (paused || !visible || document.hidden) return;
    cards.forEach((card, i) =>
      setTimeout(() => flip(card, showBack), i * STAGGER_MS),
    );
    showBack = !showBack;
  }, AUTO_MS);
}
