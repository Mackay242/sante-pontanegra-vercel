'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-medical-gradient-soft px-4 py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Nous n&apos;avons pas pu traiter votre demande. Veuillez réessayer.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground">Réf : {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <RefreshCw className="mr-1 inline h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-xl border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
        >
          <Home className="mr-1 inline h-4 w-4" />
          Accueil
        </Link>
      </div>
    </main>
  )
}
