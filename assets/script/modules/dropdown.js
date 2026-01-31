// Dropdown Functionality ============================
export function initDropdowns() {
    document.addEventListener("click", (e) => {
        const toggle = e.target.closest(".dropdown-toggle");
        const dropdown = e.target.closest(".tw-dropdown");

        // Click outside → close
        if (!dropdown) {
            document.querySelectorAll(".tw-dropdown.show")
                .forEach(d => d.classList.remove("show"));
            return;
        }

        // Toggle
        if (toggle) {
            e.preventDefault();

            document.querySelectorAll(".tw-dropdown.show")
                .forEach(d => d !== dropdown && d.classList.remove("show"));

            dropdown.classList.toggle("show");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".tw-dropdown.show")
                .forEach(d => d.classList.remove("show"));
        }
    });
}
