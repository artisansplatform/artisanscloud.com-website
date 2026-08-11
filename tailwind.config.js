export default {
  content: [
    "./*.html", // All root HTML files
    "./enterprise-copilot/**/*.html", // Nested copilot pages
    "./unified-commerce/**/*.html", // Nexus and related pages
    "./role-play-agent/**/*.html", // Arena and related pages
    "./knowledge-harvester/**/*.html", // Vault and related pages
    "./partials/**/*.html", // All Handlebars partials
    "./assets/**/*.{html,js}", // Assets (JS files may contain class names)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
