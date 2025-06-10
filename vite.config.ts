import path from 'node:path'
import reactScan from '@react-scan/vite-plugin-react-scan'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        reactScan(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: 'T5 Chat',
                short_name: 'T5 Chat',
                description: 'A ai chat application (t3.chat inspired)',
                theme_color: '#51946B',
                background_color: '#161717',
                display: 'standalone',
                icons: [
                    {
                        src: '/icon.png',
                    },
                ],
            },
            workbox: {
                cacheId: 't5-chat-v2',
                // This is where we define our caching strategies.
                // The rules are processed in order.
                runtimeCaching: [
                    {
                        // Rule 1: Cache the app shell and chat pages
                        // Matches /, /chats, /chats/, /chats/anything
                        urlPattern: /\/($|chats\/.*)/,
                        // Use StaleWhileRevalidate for fast page loads from cache,
                        // while updating in the background.
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'app-shell-and-chats',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                            },
                        },
                    },
                    {
                        // Rule 2: Cache static assets (CSS, JS, images)
                        // This is a common practice for performance.
                        urlPattern: /\.(?:js|css|ico|png|svg|jpg|jpeg|woff|woff2)$/,
                        // Use CacheFirst: if it's in the cache, serve it.
                        // If not, fetch from network and cache it.
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-assets',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
                            },
                        },
                    },
                    {
                        // Rule 3: Network only for all other requests
                        // This is the fallback rule.
                        // It matches any request that didn't match the rules above.
                        urlPattern: /^https?.*/,
                        handler: 'NetworkOnly',
                    },
                ],
            },
        }) as any,
    ],
    build: {
        outDir: 'dist/app',
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: false,
                secure: false,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
