// Scales the fixed 1600px-wide animated diagrams (.fq-frame and .fl-frame on Forge, .nx-frame on Nexus, .hv-frame
// on Vault) to their frame width. No-ops on pages without them.
export function initForgeLifecycle() {
  document
    .querySelectorAll(".fq-frame, .hv-frame, .fl-frame, .nx-frame")
    .forEach((frame) => {
      new ResizeObserver(([entry]) => {
        frame.style.setProperty(
          "--fq-s",
          entry.contentRect.width / (Number(frame.dataset.stageW) || 1600),
        );
      }).observe(frame);
    });
}
