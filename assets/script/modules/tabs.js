// Tabs Functionality ============================
export function initTabs() {
  const tabContainers = document.querySelectorAll("[data-tabs]");

  tabContainers.forEach((container) => {
    const tabs = container.querySelectorAll("[data-tab-btn]");
    const panels = container.querySelectorAll("[data-tab-panel]");

    const activateTab = (tab) => {
      const targetId = tab.getAttribute("data-tab-btn");

      // Update tab states and ARIA attributes
      tabs.forEach((t) => {
        t.classList.remove("bg-primary", "text-white");
        t.classList.add("bg-[#f6f8fb]", "text-heading");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.remove("bg-[#f6f8fb]", "text-heading");
      tab.classList.add("bg-primary", "text-white");
      tab.setAttribute("aria-selected", "true");

      // Update panel visibility
      panels.forEach((panel) => {
        if (panel.getAttribute("data-tab-panel") === targetId) {
          panel.classList.remove("hidden");
        } else {
          panel.classList.add("hidden");
        }
      });
    };

    tabs.forEach((tab) => {
      // Click handler
      tab.addEventListener("click", () => activateTab(tab));

      // Keyboard handler for accessibility
      tab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateTab(tab);
        }
      });
    });
  });
}
