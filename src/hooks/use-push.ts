'use client'

import { useCallback, useEffect, useState } from 'react'

type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'configured-false'

type PushConfig = {
  configured: boolean
  publicKey: string | null
}

/**
 * Hook to manage browser push notifications.
 * Returns status, subscribe() and unsubscribe() helpers, and a sendTest() function.
 */
export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('default')
  const [config, setConfig] = useState<PushConfig>({
    configured: false,
    publicKey: null,
  })
  const [loading, setLoading] = useState(false)

  // Check support + permission + server config
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }

    // Load server-side push config
    fetch('/api/push/subscribe')
      .then((r) => r.json())
      .then((data: PushConfig) => {
        setConfig(data)
        if (!data.configured) {
          setStatus('configured-false')
          return
        }
        // Check current permission
        if (Notification.permission === 'granted') {
          setStatus('granted')
        } else if (Notification.permission === 'denied') {
          setStatus('denied')
        } else {
          setStatus('default')
        }
      })
      .catch(() => setStatus('unsupported'))
  }, [])

  const subscribe = useCallback(async () => {
    if (!config.configured || !config.publicKey) return false

    setLoading(true)
    try {
      // 1. Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return false
      }
      setStatus('granted')

      // 2. Register service worker
      const registration = await navigator.serviceWorker.ready

      // 3. Subscribe to push manager
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey),
      })

      // 4. Send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      return res.ok
    } catch (err) {
      console.error('[push] subscribe error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [config])

  const sendTest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      return res.ok
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    status,
    loading,
    configured: config.configured,
    subscribe,
    sendTest,
  }
}

/**
 * Convert VAPID base64 public key to Uint8Array for the Push API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
