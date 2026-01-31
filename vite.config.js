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
    {
      name: 'copy-assets',
      closeBundle() {
        // Copy assets folder to dist
        const assetsSource = path.resolve(__dirname, 'assets');
        const assetsTarget = path.resolve(__dirname, 'dist/assets');
        
        // Copy script files
        const scriptSource = path.join(assetsSource, 'script');
        const scriptTarget = path.join(assetsTarget, 'script');
        
        if (fs.existsSync(scriptSource)) {
          if (!fs.existsSync(scriptTarget)) {
            fs.mkdirSync(scriptTarget, { recursive: true });
          }
          
          const files = fs.readdirSync(scriptSource);
          files.forEach(file => {
            const src = path.join(scriptSource, file);
            const dest = path.join(scriptTarget, file);
            fs.copyFileSync(src, dest);
            console.log(`Copied ${file} to dist/assets/script/`);
          });
        }
      }
    }
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
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
  },
});
