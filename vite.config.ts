import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  optimizeDeps: {
    exclude: ['fsevents']
  },
  build: {
    rollupOptions: {
      external: ['fsevents']
    }
  },
})