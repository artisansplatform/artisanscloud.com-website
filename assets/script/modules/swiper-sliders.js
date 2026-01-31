import Swiper from 'swiper';
import { Autoplay, Navigation, FreeMode } from 'swiper/modules';

// Configure Swiper to use modules
Swiper.use([Autoplay, Navigation, FreeMode]);

// Swiper Sliders ==========================================
export function initSwipers() {

    // Our Client Marquee ========================
    const clientMarqueeEl = document.querySelector(".ourClientMaruqee");
    if (clientMarqueeEl) {
        new Swiper(".ourClientMaruqee", {
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

    // Key Capability Slider ========================
    const keyCapabilitySliderEl = document.querySelector(".keyCapabilitySlider");
    if (keyCapabilitySliderEl) {
        new Swiper(".keyCapabilitySlider", {
            slidesPerView: 1,
            spaceBetween: 20,
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
    }

    // Modules Business Impact Slider ========================
    const modulesBusinessImpactSliderEl = document.querySelector(".ModulesBusinessImpactSlider");
    if (modulesBusinessImpactSliderEl) {
        new Swiper(".ModulesBusinessImpactSlider", {
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
    }

    // Use Cases Slider ========================
    const useCasesSliderEl = document.querySelector(".useCasesSlider");
    if (useCasesSliderEl) {
        new Swiper(".useCasesSlider", {
            slidesPerView: 1,
            spaceBetween: 20,
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
    }

    // Why Choose CXM Swiper ========================
    const whyChooseCXMSwiperEl = document.querySelector(".WhychooseCXMSwiper");
    if (whyChooseCXMSwiperEl) {
        new Swiper(".WhychooseCXMSwiper", {
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
    }
}
