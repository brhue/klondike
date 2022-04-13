import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/klondike/',
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['robots.txt', 'favicon.png', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Klondike Solitaire',
        short_name: 'Klondike',
        description: 'Klondike solitaire progressive web app built with React.',
        theme_color: '#222',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
