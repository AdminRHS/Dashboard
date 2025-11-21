import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    devSourcemap: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://dashboard-eight-beta-59.vercel.app',
        changeOrigin: true
      }
    }
  }
});