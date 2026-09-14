'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react'
import { useOnlineStatus, useServiceWorkerUpdate } from '@/hooks/use-online-status'
import { Button } from '@/components/ui/button'

/**
 * Offline indicator banner.
 * - Shows a red banner when offline (top of screen)
 * - Shows a green "back online" toast when reconnected (auto-dismiss after 4s)
 * - Shows a "update available" prompt when SW has a new version
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate()
  const [dismissedBackOnline, setDismissedBackOnline] = useState(false)

  // Auto-dismiss "back online" after 4 seconds
  useEffect(() => {
    if (isOnline && wasOffline) {
      setDismissedBackOnline(false)
      const t = setTimeout(() => setDismissedBackOnline(true), 4000)
      return () => clearTimeout(t)
    }
  }, [isOnline, wasOffline])

  return (
    <>
      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed inset-x-0 top-0 z-[60] animate-in slide-in-from-top-2 bg-destructive text-white shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>Vous êtes hors ligne — certaines fonctionnalités sont limitées</span>
          </div>
        </div>
      )}

      {/* Back online toast */}
      {isOnline && wasOffline && !dismissedBackOnline && (
        <div className="fixed inset-x-0 top-4 z-[60] mx-auto flex max-w-md animate-in slide-in-from-top-2 justify-center px-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
            <Wifi className="h-4 w-4" />
            <span>Connexion rétablie !</span>
            <button
              onClick={() => setDismissedBackOnline(true)}
              className="ml-2 rounded-full p-0.5 hover:bg-white/20"
              aria-label="Fermer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Service worker update available */}
      {updateAvailable && (
        <div className="fixed inset-x-0 bottom-4 z-[60] mx-auto flex max-w-md animate-in slide-in-from-bottom-2 justify-center px-4">
          <div className="flex w-full items-center gap-2 rounded-lg border bg-card p-3 shadow-xl">
            <RefreshCw className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Mise à jour disponible</p>
              <p className="text-xs text-muted-foreground">
                Une nouvelle version de l&apos;app est prête.
              </p>
            </div>
            <Button size="sm" onClick={applyUpdate}>
              Mettre à jour
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
