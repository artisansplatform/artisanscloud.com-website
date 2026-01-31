// Custom Select (Multi-Select with Checkbox & Tags)
export function initMultiSelect() {
    const selectElements = document.querySelectorAll(".js-multi-select");
    if (!selectElements.length) return;

    selectElements.forEach(select => {
        select.style.display = "none";

        let selectOrder = 0; // 🔥 keeps selection order

        const wrapper = document.createElement("div");
        wrapper.className = "relative";

        const trigger = document.createElement("div");
        trigger.className =
            select.className.replace("appearance-none", "") +
            " flex flex-wrap items-center gap-1.5 cursor-pointer h-auto min-h-[48px] overflow-hidden";

        const dropdown = document.createElement("div");
        dropdown.className = "absolute inset-x-0 mt-1 bg-white border border-gray-200 rounded-[12px] max-h-[220px] overflow-y-auto overscroll-contain z-50 hidden";

        const optionItems = [];

        trigger.innerHTML = `<span class="placeholder text-[#8DA2C2]">Select</span>`;

        [...select.options].forEach(opt => {
            if (opt.disabled) return;

            const item = document.createElement("div");
            item.className = "flex items-center gap-2.5 px-[14px] py-[10px] cursor-pointer text-[14px] hover:bg-[#f3f6fb]";
            item.innerHTML = `
        <span
    class="checkbox w-4 h-4 border border-[#BEBEBE] rounded flex items-center justify-center
           transition-all">
    <span
      class="tick hidden w-2 h-2 rounded-sm"
      style="
        background-image: url('../assets/image/icon/checkBox_tickmark_icont.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      ">
    </span>
  </span>
        <span>${opt.text}</span>
      `;

            if (opt.selected) {
                opt._order = selectOrder++;
                item.classList.add("selected");
            }

            item.addEventListener("click", e => {
                e.stopPropagation();

                const checkbox = item.querySelector(".checkbox");
                const tick = item.querySelector(".tick");

                if (!opt.selected) {
                    opt.selected = true;
                    opt._order = selectOrder++;
                    item.classList.add("selected");

                    checkbox.classList.add("bg-[#8D68F6]", "!border-[#8D68F6]");
                    tick.classList.remove("hidden");
                } else {
                    opt.selected = false;
                    opt._order = null;
                    item.classList.remove("selected");

                    checkbox.classList.remove("bg-[#8D68F6]", "!border-[#8D68F6]");
                    tick.classList.add("hidden");
                }

                renderSelected();
            });


            dropdown.appendChild(item);
            optionItems.push({ opt, item });
        });

        function renderSelected() {
            trigger.innerHTML = "";

            const selected = optionItems
                .filter(o => o.opt.selected)
                .sort((a, b) => a.opt._order - b.opt._order); // 🔥 order preserved

            if (!selected.length) {
                trigger.innerHTML =
                    `<span class="placeholder text-[#8DA2C2]">Select</span>`;
                return;
            }

            const MAX_VISIBLE = 2;
            const visible = selected.slice(0, MAX_VISIBLE);
            const remaining = selected.length - MAX_VISIBLE;

            visible.forEach(({ opt, item }) => {
                const pill = document.createElement("span");
                pill.className = "inline-flex items-center gap-1.5 bg-[#E5F1F7] px-2 pe-1 rounded-full text-[14px] text-[#222222] whitespace-nowrap flex-shrink-0";

                pill.innerHTML = `
          <span style="line-height: 26px;">${opt.text}</span>
            <span class="remove flex items-center justify-center text-center text-[14px] leading-[26px] text-[#222222] rounded-full w-5 h-5 min-w-[20px] max-w-[20px] max-h-[20px] bg-white cursor-pointer hover:text-red-500" aria-label="Remove">
            <svg width="7" height="7" viewBox="0 0 7 7" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M6.24219 0.75L0.750121 6.24207"
                stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.24805 6.24231L0.755981 0.750242"
                stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        `;

                pill.querySelector(".remove").addEventListener("click", e => {
                    e.stopPropagation();

                    opt.selected = false;
                    opt._order = null;
                    item.classList.remove("selected");

                    // ✅ FIX: untick checkbox UI
                    const checkbox = item.querySelector(".checkbox");
                    const tick = item.querySelector(".tick");

                    checkbox.classList.remove("bg-[#8D68F6]", "!border-[#8D68F6]");
                    tick.classList.add("hidden");

                    renderSelected();
                });

                trigger.appendChild(pill);
            });

            if (remaining > 0) {
                const more = document.createElement("span");
                more.className = "inline-flex bg-[#E5F1F7] text-[#222222] rounded-full px-[5px] py-0.5 text-[14px] flex-shrink-0";
                more.textContent = `+${remaining}`;
                trigger.appendChild(more);
            }
        }

        /* 🔥 Open dropdown + stop Lenis scroll */
        trigger.addEventListener("click", e => {
            e.stopPropagation();
            const isHidden = dropdown.classList.toggle("hidden");

            if (!isHidden) {
                window.lenis && window.lenis.stop();
            } else {
                window.lenis && window.lenis.start();
            }
        });

        /* 🔥 Close on outside click */
        document.addEventListener("click", e => {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.add("hidden");
                window.lenis && window.lenis.start();
            }
        });

        /* 🔥 Allow dropdown scrolling */
        dropdown.addEventListener("wheel", e => {
            e.stopPropagation();
        });

        renderSelected();

        wrapper.appendChild(trigger);
        wrapper.appendChild(dropdown);
        select.after(wrapper);
    });
}
