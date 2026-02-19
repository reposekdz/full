import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico'],
      devOptions: { enabled: true },
      manifest: {
        name: 'Garden TVET School Management System',
        short_name: 'Garden TVET',
        description: 'Complete School Management: Students, Staff, Finance, Academics, Sports & More',
        theme_color: '#eab308',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['education', 'productivity', 'business'],
        lang: 'en-US',
        dir: 'ltr',
        icons: [
          { src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '64x64', type: 'image/png', purpose: 'any' },
          { src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        shortcuts: [
          { name: 'Dashboard', url: '/', icons: [{ src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '96x96' }] },
          { name: 'Students', url: '/students', icons: [{ src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '96x96' }] },
          { name: 'Staff', url: '/staff', icons: [{ src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '96x96' }] },
          { name: 'Finance', url: '/finance', icons: [{ src: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico', sizes: '96x96' }] }
        ],
        screenshots: [
          { src: '/screenshot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: '/screenshot-mobile.png', sizes: '750x1334', type: 'image/png', form_factor: 'narrow' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2,ttf,eot}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'gstatic-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: /\/api\/.*\/*.json/, handler: 'NetworkFirst', options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 }, networkTimeoutSeconds: 10 } },
          { urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/, handler: 'CacheFirst', options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } } },
          { urlPattern: /\.(?:js|css)$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'static-resources' } }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // Ensure single React instance
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'motion/react']
        }
      }
    }
  },
  server: {
    // Development server configuration
    host: 'localhost',
    port: 5173,
    strictPort: false,
    hmr: {
      // Explicit WebSocket configuration for HMR
      clientPort: 5173,
      port: 5173,
      protocol: 'ws',
      host: 'localhost',
    },
    // Allow external access if needed
    allowedHosts: ['localhost', 'all'],
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; media-src 'self' blob:;",
    },
  },
})
