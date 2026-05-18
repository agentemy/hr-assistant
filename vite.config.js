import { defineConfig } from 'vite';

export default defineConfig({
  base: './',

  server: {
    host: '127.0.0.1',
    port: 5500,
    open: true
  },

  preview: {
    host: '127.0.0.1',
    port: 4173,
    open: true
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
});