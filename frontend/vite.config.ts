import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['logo.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-512x512-maskable.png'],
      manifest: {
        name: 'AlgoSort',
        short_name: 'AlgoSort',
        description: 'Master Data Structures & Algorithms',
        theme_color: '#6366f1',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // precache build assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // Skip caching massive json files directly if any, or just let glob handle it
        // We'll keep it simple for PWABuilder
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        sourcemap: false
      }
    })
  ],
  server: { port: 5173 },
  build: {
    sourcemap: false,
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  }
})
