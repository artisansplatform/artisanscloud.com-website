// Dropdown Functionality ============================
export function initDropdowns() {
  function resetDropdownState(dropdown) {
    dropdown.querySelectorAll(".dropdown-more").forEach((btn) => {
      btn.style.display = "";
    });
    dropdown.querySelectorAll(".dropdown-extra").forEach((extra) => {
      extra.style.maxHeight = "0";
    });
  }

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".dropdown-toggle");
    const dropdown = e.target.closest(".tw-dropdown");
    const moreBtn = e.target.closest(".dropdown-more");

    // Click outside → close
    if (!dropdown) {
      document.querySelectorAll(".tw-dropdown.show").forEach((d) => {
        resetDropdownState(d);
        d.classList.remove("show");
      });
      return;
    }

    // Retail AI "More" button → hide button, reveal extra links with shutter animation
    if (moreBtn) {
      const extra = moreBtn.nextElementSibling;
      if (extra && extra.classList.contains("dropdown-extra")) {
        moreBtn.style.display = "none";
        extra.style.maxHeight = extra.scrollHeight + "px";
      }
      return;
    }

    // Toggle
    if (toggle) {
      e.preventDefault();

      const wasOpen = dropdown.classList.contains("show");

      document.querySelectorAll(".tw-dropdown.show").forEach((d) => {
        resetDropdownState(d);
        d.classList.remove("show");
      });

      if (!wasOpen) {
        dropdown.classList.add("show");
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".tw-dropdown.show").forEach((d) => {
        resetDropdownState(d);
        d.classList.remove("show");
      });
    }
  });
}
