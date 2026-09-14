'use client'

import { useEffect, useState } from 'react'

/**
 * Detect online/offline status in real time.
 * - Uses navigator.onLine + window 'online'/'offline' events
 * - Returns { isOnline, wasOffline }
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Initial state
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}

/**
 * Check if a service worker update is available.
 * Returns the waiting SW registration if any.
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let registration: ServiceWorkerRegistration | null = null

    navigator.serviceWorker.ready.then((reg) => {
      registration = reg
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true)
            }
          })
        }
      })
    })

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', () => {})
      }
    }
  }, [])

  const applyUpdate = () => {
    if (typeof navigator === 'undefined') return
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      setTimeout(() => window.location.reload(), 500)
    })
  }

  return { updateAvailable, applyUpdate }
}
