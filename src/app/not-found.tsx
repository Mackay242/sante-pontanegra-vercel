import Link from 'next/link'
import { Heart, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-medical-gradient-soft px-4 py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-medical-gradient">
        <Heart className="h-8 w-8 text-white" fill="white" />
      </div>
      <h1 className="text-6xl font-extrabold text-primary">404</h1>
      <h2 className="mt-2 text-xl font-bold">Page introuvable</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Home className="mr-1 inline h-4 w-4" />
          Accueil
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted"
        >
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Mon espace
        </Link>
      </div>
    </main>
  )
}
