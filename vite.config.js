import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true, // Automatically open browser
    watch: {
      usePolling: true, // Better compatibility for some file systems
    },
  },
  build: {
    outDir: 'dist',
  },
});
