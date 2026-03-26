# Coding Standards

## Code Organization
- **Single responsibility**: Each JavaScript module in `assets/script/modules/` handles one feature
- **Event delegation**: Use event delegation for dynamically created elements or repeated elements
- **Vanilla JavaScript only**: No frameworks/libraries except for specific features (Swiper for sliders, Lenis for smooth scroll)
- **Progressive enhancement**: Core content accessible without JavaScript, enhanced with JS for interactivity

## Performance
- **Lazy loading**: Images should use `loading="lazy"` attribute where appropriate
- **Asset ownership**: Copy required images into this repository under `assets/image/`; do not hotlink external domains
- **CDN usage**: External libraries (Swiper, GSAP, Lenis) loaded from CDN to leverage browser caching
- **Asset optimization**: Use WebP format for images when possible

## Accessibility
- **Semantic HTML**: Use appropriate HTML5 elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.)
- **ARIA labels**: Add `aria-label` to interactive elements without text (icon buttons, close buttons)
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible (Tab, Enter, Escape)
- **Focus states**: Maintain visible focus indicators for keyboard navigation
- **Color contrast**: Ensure text meets WCAG AA standards (4.5:1 for normal text)

## Security
- **No inline scripts**: Avoid inline JavaScript for security. Use JS modules via `assets/script/main.js` instead.
- **No inline event handlers**: Do not use `onclick=""`, `onload=""`, etc. in HTML - attach event listeners in JS modules instead.
- **External links**: Add `rel="noopener noreferrer"` to external links opening in new tabs
- **Form validation**: Validate on client side with HTML5 `required` / `type` attributes. Backend validation is handled by the form processor (web3forms).
- **Dependency updates**: Keep npm packages updated to avoid known vulnerabilities
- **No secrets in code**: Never commit API keys, tokens, or sensitive data (use environment variables)
