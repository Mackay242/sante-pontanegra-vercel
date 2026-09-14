/**
 * Service Worker for Santé Pontanegra
 * v3.0 — Full offline support
 *
 * Strategies:
 *  - App shell (HTML pages): pre-cache + network-first, fallback to cache
 *  - Next.js static assets (/_next/static/): cache-first (immutable)
 *  - Images, fonts: cache-first with expiration
 *  - API GET (read-only): stale-while-revalidate (offline reads from cache)
 *  - API POST/PUT/DELETE: network-only (with offline error message)
 */

const CACHE_VERSION = 'v3'
const STATIC_CACHE = `sante-static-${CACHE_VERSION}`
const PAGES_CACHE = `sante-pages-${CACHE_VERSION}`
const API_CACHE = `sante-api-${CACHE_VERSION}`
const RUNTIME_CACHE = `sante-runtime-${CACHE_VERSION}`
const OFFLINE_URL = '/offline'

// App shell — minimal pages to make app usable offline
const PRECACHE_URLS = [
  '/',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon-32.png',
]

// Maximum number of entries per cache (LRU eviction)
const MAX_API_CACHE_ENTRIES = 50
const MAX_RUNTIME_CACHE_ENTRIES = 100

// ─── Install: pre-cache app shell ──────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
      // Force activate immediately
      await self.skipWaiting()
    })()
  )
})

// ─── Activate: clean old caches ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(`-${CACHE_VERSION}`))
          .map((k) => caches.delete(k))
      )
      await self.clients.claim()
      // Tell all clients that the new SW is active
      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      clientsList.forEach((client) => {
        client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION })
      })
    })()
  )
})

// ─── Message handler: skipWaiting on demand ────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ─── Fetch handler ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET for offline support
  if (request.method !== 'GET') {
    // For non-GET requests, try network; if fails, return offline error
    event.respondWith(handleMutationRequest(request))
    return
  }

  // Skip non-http(s)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // Skip Next.js HMR/websocket
  if (url.pathname.startsWith('/_next/webpack-hmr')) return
  if (url.pathname.includes('hot-update')) return

  // Skip Chrome extension requests
  if (url.host !== self.location.host && url.origin !== self.location.origin) {
    // Cross-origin: only handle if it's a known image / media domain
    return
  }

  // ── Next.js static assets (immutable, cache-first) ──
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp|avif|ico)$/i)
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE))
    return
  }

  // ── API GET (stale-while-revalidate for offline reads) ──
  if (url.pathname.startsWith('/api/')) {
    // Don't cache auth/me, debug, push (always fresh)
    if (
      url.pathname === '/api/auth/me' ||
      url.pathname.startsWith('/api/debug/') ||
      url.pathname.startsWith('/api/push/')
    ) {
      event.respondWith(networkFirst(request, API_CACHE))
      return
    }
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
    return
  }

  // ── Navigation (HTML pages): network-first with cache fallback ──
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(handleNavigation(request))
    return
  }

  // ── Other same-origin requests: cache-first ──
  event.respondWith(cacheFirst(request, RUNTIME_CACHE))
})

// ─── Strategies ────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone())
      trimCache(cacheName, MAX_RUNTIME_CACHE_ENTRIES)
    }
    return response
  } catch {
    return cached || new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ error: 'OFFLINE', message: 'Vous êtes hors ligne.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok && response.type === 'basic') {
        cache.put(request, response.clone())
        trimCache(cacheName, MAX_API_CACHE_ENTRIES)
      }
      return response
    })
    .catch(() => cached) // If fetch fails, return cached (already handled above)

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise
}

async function handleNavigation(request) {
  const cache = await caches.open(PAGES_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
      trimCache(PAGES_CACHE, 20)
    }
    return response
  } catch {
    // Network failed — try cache first
    const cached = await cache.match(request)
    if (cached) return cached

    // Try cache for "/" (homepage) as fallback
    const homeCached = await cache.match('/')
    if (homeCached) return homeCached

    // Last resort: offline page
    const staticCache = await caches.open(STATIC_CACHE)
    const offline = await staticCache.match(OFFLINE_URL)
    if (offline) return offline

    return new Response(
      `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne — Santé Pontanegra</title></head>
      <body style="font-family:system-ui,-apple-system,sans-serif;background:#daeef6;color:#1a1a1a;padding:2rem;text-align:center;min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column">
        <div style="font-size:4rem;margin-bottom:1rem">📡</div>
        <h1 style="color:#0d7a5f;margin:0">Vous êtes hors ligne</h1>
        <p style="margin:.5rem 0 2rem;max-width:400px;color:#555">Vérifiez votre connexion internet puis réessayez. Les pages déjà visitées restent accessibles.</p>
        <button onclick="location.reload()" style="padding:.75rem 1.5rem;background:#0d7a5f;color:white;border:0;border-radius:.5rem;font-size:1rem;cursor:pointer">Réessayer</button>
        <a href="/" style="margin-top:1rem;color:#0d7a5f">← Retour à l'accueil</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}

async function handleMutationRequest(request) {
  try {
    return await fetch(request)
  } catch {
    return new Response(
      JSON.stringify({
        error: 'OFFLINE',
        message:
          'Action impossible hors ligne. Veuillez vous reconnecter à internet.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ─── Cache LRU trim ───────────────────────────────────────
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    // Delete oldest entries (first in)
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map((k) => cache.delete(k)))
  }
}

// ─── Push notifications ────────────────────────────────────
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

// ─── Notification click ────────────────────────────────────
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

// ─── Periodic sync (background sync) ───────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sante-sync') {
    event.waitUntil(
      (async () => {
        // Notify clients that connection is back
        const clientsList = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        clientsList.forEach((client) => {
          client.postMessage({ type: 'BACK_ONLINE' })
        })
      })()
    )
  }
})
