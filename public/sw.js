/**
 * Service Worker for Santé Pontanegra
 * - Offline support (cache-first for static, network-first for API)
 * - Push notifications
 * - Click actions
 *
 * Version: 2.0 — PWA with offline support
 */

const CACHE_VERSION = 'v2'
const STATIC_CACHE = `sante-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `sante-runtime-${CACHE_VERSION}`
const OFFLINE_URL = '/offline'

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline',
]

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      // Pre-cache app shell (best-effort, ignore failures)
      await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url))
      )
      await self.skipWaiting()
    })()
  )
})

// ─── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

// ─── Fetch ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // Skip Next.js HMR/websocket
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // ── API requests: network-first, fallback to cache ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // ── Same-origin navigation: network-first, fallback to offline page ──
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  // ── Static assets (same origin): cache-first ──
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Other cross-origin requests: try network, fallback to cache
  event.respondWith(networkFirst(request))
})

// ─── Cache strategies ─────────────────────────────────────

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error('Offline')
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    // Try offline page
    const offline = await cache.match(OFFLINE_URL)
    if (offline) return offline
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hors ligne</title></head>
      <body style="font-family:system-ui;background:#daeef6;color:#1a1a1a;padding:2rem;text-align:center">
        <h1>Vous êtes hors ligne</h1>
        <p>Vérifiez votre connexion internet puis réessayez.</p>
        <button onclick="location.reload()" style="margin-top:1rem;padding:.75rem 1.5rem;background:#0d7a5f;color:white;border:0;border-radius:.5rem">Réessayer</button>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}

// ─── Push ─────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = {
      title: 'Santé Pontanegra',
      body: event.data.text(),
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    tag: data.tag || 'sante-notification',
    requireInteraction: data.requireInteraction ?? false,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// ─── Notification click ───────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of allClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })()
  )
})
