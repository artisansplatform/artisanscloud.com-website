export default {
  content: [
    "./*.html",                    // All root HTML files
    "./partials/**/*.html",        // All Handlebars partials
    "./assets/**/*.{html,js}",     // Assets (JS files may contain class names)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
