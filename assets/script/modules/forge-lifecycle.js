// Scales the fixed 1600px-wide animated diagrams (.fq-frame on Forge, .hv-frame
// on Vault) to their frame width. No-ops on pages without them.
export function initForgeLifecycle() {
  document.querySelectorAll(".fq-frame, .hv-frame").forEach((frame) => {
    new ResizeObserver(([entry]) => {
      frame.style.setProperty("--fq-s", entry.contentRect.width / 1600);
    }).observe(frame);
  });
}
