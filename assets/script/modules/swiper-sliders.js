import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

// Configure Swiper to use modules
Swiper.use([Navigation]);

// Swiper Sliders ==========================================
export function initSwipers() {

    // Note: the client logo marquee on the homepage is CSS-only
    // (.logoMarquee in assets/style/input.css), not a Swiper instance.

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

    // Nexus Capability Slider ========================
    const nexusCapabilitySliderEl = document.querySelector(".nexusCapabilitySlider");
    if (nexusCapabilitySliderEl) {
        new Swiper(".nexusCapabilitySlider", {
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
                nextEl: ".swiper-button-next-nexusCapability",
                prevEl: ".swiper-button-prev-nexusCapability",
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

    // POS Features Slider ========================
    const posFeaturesSliderEl = document.querySelector(".POSFeaturesSlider");
    if (posFeaturesSliderEl) {
        new Swiper(".POSFeaturesSlider", {
            slidesPerView: 1,
            spaceBetween: 20,
            speed: 700,
            allowTouchMove: true,
            pagination: false,
            navigation: {
                nextEl: ".swiper-button-next-pos-features",
                prevEl: ".swiper-button-prev-pos-features",
            },
        });
    }

    // Benefits OTB Slider ========================
    const benefitsOTBSliderEl = document.querySelector(".benefitsOTBSlider");
    if (benefitsOTBSliderEl) {
        new Swiper(".benefitsOTBSlider", {
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
                nextEl: ".swiper-button-next-benefitsOTB",
                prevEl: ".swiper-button-prev-benefitsOTB",
            },
        });
    }

    // Dynamic Pricing Slider ========================
    const dynamicPricingSliderEl = document.querySelector(".DynamicPricingSlider");
    if (dynamicPricingSliderEl) {
        new Swiper(".DynamicPricingSlider", {
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
                nextEl: ".swiper-button-next-dynamicPricing",
                prevEl: ".swiper-button-prev-dynamicPricing",
            },
        });
    }

    // Personalized CX Experience Slider ========================
    const personalizedCXExperienceSliderEl = document.querySelector(".PersonalizedCXExperienceSlider");
    if (personalizedCXExperienceSliderEl) {
        new Swiper(".PersonalizedCXExperienceSlider", {
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
                nextEl: ".swiper-button-next-personalizedCXExperience",
                prevEl: ".swiper-button-prev-personalizedCXExperience",
            },
        });
    }

    // Personalized Recommendations Slider ========================
    const personalizedRecsSliderEl = document.querySelector(".PersonalizedRecsSlider");
    if (personalizedRecsSliderEl) {
        new Swiper(".PersonalizedRecsSlider", {
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
                nextEl: ".swiper-button-next-personalizedRecs",
                prevEl: ".swiper-button-prev-personalizedRecs",
            },
        });
    }
}
