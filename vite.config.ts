import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'FFD400EEL 电子手册',
        short_name: 'FFD400EEL',
        description: 'ANDRITZ FFD400EEL 纤维流滚筒碎浆机 - 中英双语电子手册',
        theme_color: '#1976D2',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'any',
        start_url: '/SP-FFD-COMMISION/',
        scope: '/SP-FFD-COMMISION/',
        icons: [
          { src: '/SP-FFD-COMMISION/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/SP-FFD-COMMISION/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'github-api', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
        ],
      },
    }),
  ],
  base: '/SP-FFD-COMMISION/',
  build: { outDir: 'docs', assetsDir: 'assets' },
})
