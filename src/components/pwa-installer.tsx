'use client'

import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'sante_pwa_install_dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSHint, setShowIOSHint] = useState(false)

  useEffect(() => {
    // Don't show in dev environment
    if (process.env.NODE_ENV === 'development') return

    // Don't show if already installed (standalone)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS standalone detection
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
    ) {
      return
    }

    // iOS detection
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream
    if (isIOSDevice) {
      setIsIOS(true)
      // Show iOS hint after a delay, if not dismissed
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (!dismissed || Date.now() - Number(dismissed) > DISMISS_DURATION_MS) {
        const t = setTimeout(() => setShowIOSHint(true), 8000)
        return () => clearTimeout(t)
      }
      return
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (!dismissed || Date.now() - Number(dismissed) > DISMISS_DURATION_MS) {
        setShow(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setShow(false)
    setShowIOSHint(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  // Android/Chrome install banner
  if (show && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 lg:bottom-4">
        <Card className="border-primary/30 shadow-xl">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-medical-gradient">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Installer Santé Pontanegra</p>
              <p className="text-xs text-muted-foreground">
                Accédez à votre santé en un tap, hors ligne aussi.
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                aria-label="Fermer"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleInstall}>
                <Download className="mr-1 h-4 w-4" />
                Installer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // iOS hint (no native prompt available)
  if (showIOSHint) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 lg:bottom-4">
        <Card className="border-primary/30 shadow-xl">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-medical-gradient">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Installer Santé Pontanegra
                </p>
                <p className="text-xs text-muted-foreground">
                  Sur l&apos;écran d&apos;accueil pour un accès rapide.
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                aria-label="Fermer"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ol className="ml-1 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
              <li>
                Appuyez sur le bouton{' '}
                <span className="font-medium text-foreground">Partager</span>{' '}
                <ShareIcon /> en bas de l&apos;écran.
              </li>
              <li>
                Sélectionnez{' '}
                <span className="font-medium text-foreground">
                  « Sur l&apos;écran d&apos;accueil »
                </span>{' '}
                <PlusIcon />.
              </li>
              <li>Appuyez sur « Ajouter ».</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

function ShareIcon() {
  return (
    <svg
      className="inline-block h-3 w-3"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16 5l-4 4h2v6h4v-6h2l-4-4zM8 11H4v8h4v-8zm0-2V3l4 4-4 4V9z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="inline-block h-3 w-3"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  )
}
