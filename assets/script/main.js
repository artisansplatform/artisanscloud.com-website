document.addEventListener("DOMContentLoaded", () => {
    // Smooth Scrolling (Lenis) ========================
    function smoothScroll() {
        if (typeof Lenis === "undefined") return;
        const lenis = new Lenis({
            smooth: true,
            lerp: 0.08,
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
    smoothScroll();


    // Header ============================
    const header = document.getElementById("siteHeader");
    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        const currentScroll = window.scrollY;
        if (currentScroll > 20) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });


    // Dropdown Functionality ============================
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

    // Mobile Menu Functionality ============================
    const nav = document.getElementById("mainNav");
    const menuToggle = document.getElementById("menuToggle");
    const closeBtn = document.getElementById("menuClose");
    const overlay = document.getElementById("menuOverlay");

    const mqLg = window.matchMedia("(min-width: 1024px)");

    if (nav && menuToggle && overlay) {
        const openMenu = () => {
            nav.classList.remove("translate-x-full");
            overlay.classList.remove("opacity-0", "invisible");
            document.body.classList.add("overflow-hidden");
        };

        const closeMenu = () => {
            nav.classList.add("translate-x-full");
            overlay.classList.add("opacity-0", "invisible");
            document.body.classList.remove("overflow-hidden");
        };

        menuToggle.addEventListener("click", openMenu);
        closeBtn?.addEventListener("click", closeMenu);
        overlay.addEventListener("click", closeMenu);

        const handleBreakpoint = (e) => {
            if (e.matches) {
                overlay.classList.add("opacity-0", "invisible");
                nav.classList.remove("translate-x-full");
                document.body.classList.remove("overflow-hidden");
            } else {
                nav.classList.add("translate-x-full");
            }
        };

        handleBreakpoint(mqLg);
        mqLg.addEventListener("change", handleBreakpoint);
    }



    // Button Ripple Effect ========================
    function btnRippleEffect() {
        const buttons = document.querySelectorAll(".btn");
        if (!buttons.length) return;

        buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const ripple = document.createElement("span");
                ripple.className = "ripple";
                const size = Math.max(btn.offsetWidth, btn.offsetHeight);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.offsetX - size / 2}px`;
                ripple.style.top = `${e.offsetY - size / 2}px`;
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
    btnRippleEffect();


    // Our Client Marquee ========================
    function clientMarquee() {
        const clientMarquee = new Swiper(".ourClientMaruqee", {
            slidesPerView: "auto",
            spaceBetween: 0,
            speed: 3000,
            allowTouchMove: true,
            simulateTouch: false,
            touchStartPreventDefault: false,
            freeMode: true,
            freeModeMomentum: false,
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
            },
            loop: true,
        });

    }
    clientMarquee();


    // Swiper Sliders ==========================================
    var swiper = new Swiper(".keyCapabilitySlider", {
        slidesPerView: 1,
        spaceBetween: 20,
        // speed: 700,
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
        },
        pagination: false,
        navigation: {
            nextEl: ".swiper-button-next-keyCapability",
            prevEl: ".swiper-button-prev-keyCapability",
        },
    });

    var swiper = new Swiper(".ModulesBusinessImpactSlider", {
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 700,
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 15,
            },
            1024: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
        },
        pagination: false,
        navigation: {
            nextEl: ".swiper-button-next-module",
            prevEl: ".swiper-button-prev-module",
        },
    });

    var swiper = new Swiper(".useCasesSlider", {
        slidesPerView: 1,
        spaceBetween: 20,
        // speed: 700,
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
        },
        pagination: false,
        navigation: {
            nextEl: ".swiper-button-next-useCasesSlider",
            prevEl: ".swiper-button-prev-useCasesSlider",
        },
    });

    var swiper = new Swiper(".WhychooseCXMSwiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 700,
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 15,
            },
            1024: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
        },
        pagination: false,
        navigation: {
            nextEl: ".swiper-button-next-WhychooseCXMSwiper",
            prevEl: ".swiper-button-prev-WhychooseCXMSwiper",
        },
    });


    // Counter ========================
    const counters = document.querySelectorAll(".counter");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = +counter.dataset.target || +counter.innerText;
            const duration = 1500;
            const startTime = performance.now();

            const animate = (time) => {
                const progress = Math.min((time - startTime) / duration, 1);
                counter.innerText = Math.floor(progress * target);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.innerText = target;
                }
            };

            requestAnimationFrame(animate);
            observer.unobserve(counter);
        });
    }, { threshold: 0.3 });

    counters.forEach(counter => observer.observe(counter));


    // element enter animation effect ========================
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray('.fade-in').forEach((el) => {
            gsap.from(el, {
                y: 50,
                opacity: 0,
                duration: 0.5,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    end: 'top 85%',
                    toggleActions: 'play none none none',
                },
            });
        });
    });
    mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray('.fade-in').forEach((el) => {
            gsap.from(el, {
                y: 30,
                opacity: 0,
                duration: 0.4,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 95%',
                    end: 'top 90%',
                    toggleActions: 'play none none none',
                },
            });
        });
    });


    // Cursor Effects (Reusable) ========================
    const cursor = document.getElementById("cursor");

    function attachCursorEffect(el, bg, scale = 1) {
        if (!el || !cursor || typeof gsap === "undefined") return;

        el.addEventListener("mousemove", (e) => {
            gsap.to(cursor, {
                x: e.x,
                y: e.y,
                xPercent: -50,
                yPercent: -50,
                duration: 0.3,
                background: bg,
            });
        });

        el.addEventListener("mouseenter", () => {
            gsap.to(cursor, {
                scale,
                opacity: 1,
                duration: 0.3,
            });
        });

        el.addEventListener("mouseleave", () => {
            gsap.to(cursor, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
            });
        });
    }

    // Sections ==================================
    attachCursorEffect(
        document.querySelector(".CTA_sec"),
        "#ffffff8b",
        1
    );
    attachCursorEffect(
        document.querySelector(".impactFrameworkCTA"),
        "#ffffff8b",
        1
    );

    attachCursorEffect(
        document.querySelector(".strategicOutcomeBanner_sec"),
        "#dadada8b",
        1
    );

    attachCursorEffect(
        document.querySelector(".strategicImpact_sec .leftCard"),
        "#f9d0f2ff",
        1
    );

    attachCursorEffect(
        document.querySelector(".gridGradientCard"),
        "#f9d0f2aa",
        1
    );

    document.querySelectorAll(".ftrGetStartCard").forEach(card => {
        attachCursorEffect(card, "#f9d0f2ff", 0.5);
    });


    // Hero Section ========================
    const heroTl = gsap.timeline();
    heroTl.from('#heroHeading, #heroDec', {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: 'linear',
        stagger: 0.3
    }, 'hero')
        .from('#heroBtn', {
            y: 50,
            scale: 0,
            opacity: 0,
            duration: 0.5
        }, 'hero+=0.3');


    // Footer Artisans Text =============
    function footerTitleEffect() {
        const ftrTitles = document.querySelectorAll(".ftrBottomTitle");
        if (!ftrTitles.length || typeof gsap === "undefined") return;

        ftrTitles.forEach(title => {

            title.addEventListener("mouseenter", () => {
                gsap.set(title, {
                    backgroundImage: `
                        url('assets/image/logo-icon.svg'),
                        linear-gradient(93.32deg, #D9CCFF 1.4%, #A1EFF5 101.99%)
                    `,
                    backgroundRepeat: "no-repeat, no-repeat",
                    backgroundSize: "140px 140px, 100% 100%",
                    backgroundPosition: "50% 50%, 50% 50%",
                });
            });

            title.addEventListener("mousemove", (e) => {
                const rect = title.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                gsap.to(title, {
                    backgroundPosition: `${x}% ${y}%, 50% 50%`,
                    duration: 0.2,
                    ease: "none",
                });
            });

            title.addEventListener("mouseleave", () => {
                gsap.set(title, {
                    backgroundImage: `
                        linear-gradient(93.32deg, #D9CCFF 1.4%, #A1EFF5 101.99%)
                    `,
                    backgroundPosition: "50% 50%",
                    backgroundSize: "100% 100%",
                });
            });
        });
    }
    footerTitleEffect();
})

// Custom Select (Multi-Select with Checkbox & Tags)

function selecter() {
    document.querySelectorAll(".js-multi-select").forEach(select => {
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
selecter()