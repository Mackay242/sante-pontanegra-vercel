/**
 * Service Worker for Santé Pontanegra
 * Handles push notifications and click actions.
 */

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// ─── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

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
    icon: '/icon.svg',
    badge: '/icon.svg',
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

      // Focus existing window if any
      for (const client of allClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }

      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })()
  )
})
