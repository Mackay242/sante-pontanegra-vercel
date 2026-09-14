'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home, MessageCircle, MapPin, Users } from 'lucide-react'

export default function OfflinePage() {
  const cachedPages = [
    { href: '/', label: 'Accueil', icon: Home, desc: 'Page d\'accueil publique' },
    { href: '/login', label: 'Connexion', icon: RefreshCw, desc: 'Page de connexion' },
    { href: '/dashboard', label: 'Dashboard', icon: Home, desc: 'Tableau de bord (si connecté)' },
    { href: '/medecin', label: 'Médecin IA', icon: MessageCircle, desc: 'Historique du chat (sans nouvelles réponses)' },
    { href: '/centres', label: 'Centres', icon: MapPin, desc: 'Liste des centres en cache' },
    { href: '/communaute', label: 'Communauté', icon: Users, desc: 'Posts déjà chargés' },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-medical-gradient-soft px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold">Vous êtes hors ligne</h1>
          <p className="mt-3 text-muted-foreground">
            Santé Pontanegra ne peut pas se connecter à internet pour le moment.
            Vous pouvez toujours accéder aux pages déjà visitées ci-dessous.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Pages accessibles hors ligne
          </h2>
          {cachedPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:border-primary hover:shadow-sm tap-feedback"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{page.label}</p>
                  <p className="text-xs text-muted-foreground">{page.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => location.reload()}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 tap-feedback"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Réessayer la connexion
          </button>
          <p className="text-center text-xs text-muted-foreground">
            💡 Astuce : Les vidéos, images et données déjà chargées restent visibles.
            Les nouvelles actions (posts, RDV) seront en file d&apos;attente et
            synchronisées à votre retour en ligne.
          </p>
        </div>
      </div>
    </main>
  )
}
