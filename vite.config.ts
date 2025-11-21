import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    proxy: {
      '/api': {
        target: 'https://dashboard-eight-beta-59.vercel.app',
        changeOrigin: true
      }
    }
  }
});