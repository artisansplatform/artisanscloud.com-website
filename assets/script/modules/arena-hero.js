// Arena hero: plays the role-play scene on a loop. Messages appear one by one,
// then the feedback ring, score and bars fill in. No-ops without #arenaHero.
export function initArenaHero() {
  const root = document.getElementById("arenaHero");
  if (!root) return;
  const msgs = [...root.querySelectorAll(".arenaHero-msg")];
  const score = root.querySelector(".arenaHero-score");
  const to = Number(score.dataset.to);

  const showAll = () => {
    msgs.forEach((m) => m.classList.add("is-on"));
    root.classList.add("is-scored");
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return showAll();

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const count = async () => {
    for (let n = 0; n <= to; n += 2) {
      score.textContent = Math.min(n, to);
      await wait(18);
    }
    score.textContent = to;
  };

  (async function play() {
    for (;;) {
      msgs.forEach((m) => m.classList.remove("is-on"));
      root.classList.remove("is-scored");
      score.textContent = "0";
      await wait(600);
      for (const m of msgs) {
        m.classList.add("is-on");
        await wait(1300);
      }
      root.classList.add("is-scored");
      await count();
      await wait(4500);
    }
  })();
}
