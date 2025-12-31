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
            allowTouchMove: false,
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