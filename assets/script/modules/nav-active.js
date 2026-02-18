// Active Navigation State ============================
export function initNavActive() {
    function normalizePath(href) {
        if (!href || href === '#' || href.startsWith('#')) return null;
        try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return null;
            let path = url.pathname.replace(/\/+$/, '') || '/';
            // Treat /index as root
            if (path === '/index') path = '/';
            return path;
        } catch {
            return null;
        }
    }

    let currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (currentPath === '/index') currentPath = '/';

    // Header nav links (desktop + mobile) – only <a> tags with href
    document.querySelectorAll('.header-link[href]').forEach(link => {
        if (normalizePath(link.href) === currentPath) {
            link.classList.add('active');
        }
    });

    // Dropdown items – also highlight the parent dropdown toggle button
    document.querySelectorAll('.tw-dropdown .dropdown-item[href]').forEach(item => {
        if (normalizePath(item.href) === currentPath) {
            item.classList.add('active');
            const dropdown = item.closest('.tw-dropdown');
            if (dropdown) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.classList.add('active');
            }
        }
    });

    // Footer navigation links (Company / Our Solutions columns)
    document.querySelectorAll('footer .flex.flex-col a[href]').forEach(link => {
        if (normalizePath(link.href) === currentPath) {
            link.classList.add('active');
        }
    });
}
