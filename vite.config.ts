import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'
import Sitemap from 'vite-plugin-sitemap'


export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue(),Sitemap(
    {
      hostname: 'https://www.superchange.ai',
      dynamicRoutes: ['/', '/blog', '/privacy', '/feed', '/providers'],
      exclude: ['/signup', '/login', '/alerts'],
      changefreq: 'daily',
      priority: 1.0,
      robots: [
        { userAgent: '*', allow: '/' },
        { userAgent: '*', disallow: ['/signup', '/login'] }, 
      ],
    })],
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