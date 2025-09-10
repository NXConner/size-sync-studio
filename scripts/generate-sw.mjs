// Generates a production service worker using Workbox
import { generateSW } from 'workbox-build'
import { fileURLToPath } from 'url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, '..', 'dist')

const { count, size, warnings } = await generateSW({
  globDirectory: distDir,
  globPatterns: [
    '**/*.{html,js,css,svg,png,webp,avif,woff2}',
  ],
  swDest: path.join(distDir, 'sw.js'),
  navigateFallback: '/index.html',
  cleanupOutdatedCaches: true,
  sourcemap: false,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
    },
    // Queue write operations when offline and replay later
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'POST',
      options: {
        backgroundSync: {
          name: 'api-queue',
          options: { maxRetentionTime: 24 * 60 },
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'PUT',
      options: {
        backgroundSync: {
          name: 'api-queue',
          options: { maxRetentionTime: 24 * 60 },
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      method: 'DELETE',
      options: {
        backgroundSync: {
          name: 'api-queue',
          options: { maxRetentionTime: 24 * 60 },
        },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'images' },
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/opencv/'),
      handler: 'CacheFirst',
      options: { cacheName: 'opencv', expiration: { maxEntries: 4 } },
    },
  ],
})

if (warnings?.length) {
  for (const w of warnings) console.warn('[workbox]', w)
}
console.log(`[workbox] generated sw.js with ${count} files, ${(size/1024).toFixed(1)} KiB`)

