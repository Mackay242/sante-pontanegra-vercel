'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Handles the Android hardware back button in the Capacitor app.
 * - On the home page (/dashboard, /, /login, /register): exits the app
 * - On other pages: navigates back in history
 *
 * Only runs on native (Capacitor) platforms — no effect on web browser.
 */
export function BackButtonHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cleanup: (() => void) | undefined

    async function setupBackButton() {
      try {
        const [{ Capacitor }, { App }] = await Promise.all([
          import('@capacitor/core'),
          import('@capacitor/app'),
        ])

        // Only run on native (Capacitor) platform
        if (!Capacitor.isNativePlatform()) return

        const listener = await App.addListener('backButton', () => {
          // Home / auth pages — exit the app
          if (
            pathname === '/dashboard' ||
            pathname === '/' ||
            pathname === '/login' ||
            pathname === '/register'
          ) {
            App.exitApp()
            return
          }

          // Other pages — try to go back
          if (window.history.length > 1) {
            window.history.back()
          } else {
            router.push('/dashboard')
          }
        })

        cleanup = () => {
          listener.remove()
        }
      } catch {
        // Capacitor not available (web browser) — ignore
      }
    }

    setupBackButton()

    return () => {
      cleanup?.()
    }
  }, [pathname, router])

  return null
}
