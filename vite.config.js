import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Get all HTML files in the root directory
const htmlFiles = glob.sync('*.html', { cwd: __dirname });
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace('.html', '');
  input[name] = path.resolve(__dirname, file);
});

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: path.resolve(__dirname, 'partials'),
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input,
    },
  },
  server: {
    port: 3000,
    open: true, // Automatically open browser
    watch: {
      usePolling: true, // Better compatibility for some file systems
    },
  },
});
