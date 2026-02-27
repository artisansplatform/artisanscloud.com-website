# Troubleshooting

## UI Issues
- **Dropdown not showing**: Check `.show` class is being toggled + z-index layers
- **Swiper not rendering**: Verify Swiper CDN link loaded + new slider instance created in JS
- **Styles not applying**: Run `npm run dev` to rebuild `output.css`, check Tailwind class names are correct
- **Mobile nav stuck**: Check `overflow-hidden` class on `document.body`, verify overlay click handlers
- **Header sticking on scroll**: Verify `.header-scrolled` toggling in scroll event listener

## Build Issues
- **Build fails**: Ensure `partials/header.html` and `partials/footer.html` exist, check for syntax errors in HTML
- **Page not found in dev**: Ensure HTML file is in root directory, access without `.html` extension
- **Console errors**: Check browser DevTools console for JavaScript errors, missing resources

## Blog System Issues
- **Blog cards empty**: Check `#blog-grid` / `#insights-grid` IDs exist in HTML, verify `blog-articles.js` is imported in `main.js`
- **Blog cards not updating**: Verify cron job runs (`/api/cron/fetch-articles`), check Vercel Blob for `articles.json`, confirm LinkedIn env vars are set
- **"Vercel Blob: No token found"**: Blob store not provisioned — see [dynamic-blog-setup.md](dynamic-blog-setup.md#step-1-create-the-vercel-blob-store)
- **`/api/articles` returns fallback data**: Blob is empty (no cron run yet) or Blob read failed — trigger cron manually
- **Cron returns 401**: `Authorization` header doesn't match `CRON_SECRET` env var
- **LinkedIn API returns 401**: Access token expired and refresh failed — see [token lifecycle](dynamic-blog-setup.md#token-lifecycle)
- **LinkedIn API returns 403**: App needs the **Pages Data Portability API** product (grants `r_dma_admin_pages_content`). Auth user must be page ADMINISTRATOR. This product must be the only one on the LinkedIn app.
- **No articles returned**: DMA OriginalArticles API only returns long-form LinkedIn Articles/Newsletters; regular posts/shares are excluded
- **Images not loading**: LinkedIn thumbnail download may have failed; `onerror` fallback shows local placeholder
