// Dropdown Functionality ============================
export function initDropdowns() {
    const retailAiPanel = document.getElementById("retailAiPanel");
    const solutionsDropdown = document.getElementById("solutionsDropdown");

    document.addEventListener("click", (e) => {
        const toggle = e.target.closest(".dropdown-toggle");
        const dropdown = e.target.closest(".tw-dropdown");
        const retailAiTrigger = e.target.closest("[data-retail-ai-trigger]");
        const isInsidePanel = retailAiPanel && !!e.target.closest("#retailAiPanel");
        const retailAiBack = e.target.closest("#retailAiBack");

        // Back button: close panel, reopen Solutions dropdown
        if (retailAiBack) {
            e.preventDefault();
            if (retailAiPanel) retailAiPanel.classList.remove("show");
            if (solutionsDropdown) solutionsDropdown.classList.add("show");
            return;
        }

        // Retail AI trigger: close Solutions dropdown, open panel
        if (retailAiTrigger) {
            e.preventDefault();
            document.querySelectorAll(".tw-dropdown.show").forEach(d => d.classList.remove("show"));
            if (retailAiPanel) retailAiPanel.classList.add("show");
            return;
        }

        // Click outside all menus: close everything
        if (!dropdown && !isInsidePanel) {
            document.querySelectorAll(".tw-dropdown.show").forEach(d => d.classList.remove("show"));
            if (retailAiPanel) retailAiPanel.classList.remove("show");
            return;
        }

        // Toggle a dropdown
        if (toggle) {
            e.preventDefault();
            if (retailAiPanel) retailAiPanel.classList.remove("show");
            document.querySelectorAll(".tw-dropdown.show")
                .forEach(d => d !== dropdown && d.classList.remove("show"));
            dropdown.classList.toggle("show");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".tw-dropdown.show").forEach(d => d.classList.remove("show"));
            if (retailAiPanel) retailAiPanel.classList.remove("show");
        }
    });
}
