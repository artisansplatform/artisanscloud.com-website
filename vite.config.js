import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import path from 'path';
import { glob } from 'glob';

// Get all HTML files in the root directory
const htmlFiles = glob.sync('*.html', { cwd: __dirname });
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace('.html', '');
  input[name] = path.resolve(__dirname, file);
});

// Add main.js as an explicit Rollup entry so Vite bundles and hashes it
input['main'] = path.resolve(__dirname, 'assets/script/main.js');

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
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  server: {
    port: 3000,
    open: true, // Automatically open browser
    watch: {
      usePolling: true, // Better compatibility for some file systems
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
  },
});
