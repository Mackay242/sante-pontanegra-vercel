'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Heart,
  MapPin,
  MessageCircle,
  Video,
  FileText,
  Users,
  Shield,
  Clock,
  Phone,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { EMERGENCY_NUMBERS } from '@/lib/data/centres'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur pt-safe">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-gradient">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Santé Pontanegra
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted tap-feedback"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 tap-feedback"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-medical-gradient-soft" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-medium text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Disponible 24h/24 à Pointe-Noire
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Votre santé,
                <br />
                <span className="text-primary">notre priorité.</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
                Santé Pontanegra vous accompagne au quotidien : centres de santé
                proches, médecin en ligne, dossier médical, vaccination,
                sensibilisation.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted"
                >
                  J&apos;ai déjà un compte
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Anonyme possible
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  100% gratuit
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Données protégées
                </div>
              </div>
            </div>

            {/* Card preview */}
            <div className="relative">
              <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative rounded-3xl border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Numéros d&apos;urgence
                  </span>
                  <Phone className="h-4 w-4 text-destructive" />
                </div>
                <ul className="space-y-3">
                  {EMERGENCY_NUMBERS.map((e) => (
                    <li
                      key={e.number}
                      className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                    >
                      <span className="text-sm">{e.label}</span>
                      <span className="font-bold tabular-nums text-destructive">
                        {e.number}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl bg-medical-gradient p-4 text-white">
                  <p className="text-sm font-semibold">Service Médecin IA</p>
                  <p className="text-xs text-white/90">
                    Posez vos questions santé, 24/7, gratuitement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Tout pour votre santé, au même endroit
          </h2>
          <p className="mt-2 text-muted-foreground">
            Une plateforme complète pour les habitants de Pointe-Noire.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border bg-card p-6 transition hover:shadow-md"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-4 md:px-6">
          {[
            { label: 'Centres référencés', value: '8+' },
            { label: 'Vidéos santé', value: '8+' },
            { label: 'Disponibilité', value: '24/7' },
            { label: 'Coût', value: 'Gratuit' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="rounded-3xl bg-medical-gradient p-8 text-center text-white md:p-12">
          <h2 className="text-3xl font-bold">Prêt à prendre soin de vous ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Créez votre compte gratuit et accédez à tous les services de santé
            de Pointe-Noire en quelques secondes.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow hover:bg-white/90"
          >
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground md:px-6">
          <p>© {new Date().getFullYear()} Santé Pontanegra — Pointe-Noire, République du Congo.</p>
        </div>
      </footer>
    </main>
  )
}

const FEATURES = [
  {
    icon: MapPin,
    title: 'Centres de santé proches',
    desc: 'Hôpitaux, cliniques et CSI de Pointe-Noire avec horaires et contacts.',
  },
  {
    icon: MessageCircle,
    title: 'Médecin en ligne',
    desc: 'Posez vos questions à notre assistant médical IA, anonyme et gratuit.',
  },
  {
    icon: FileText,
    title: 'Dossier médical',
    desc: 'Centralisez groupe sanguin, allergies, antécédents et traitements.',
  },
  {
    icon: Video,
    title: 'Vidéos de sensibilisation',
    desc: 'Apprenez les bons gestes santé avec nos vidéos courtes et validées.',
  },
  {
    icon: Users,
    title: 'Communauté',
    desc: 'Échangez avec d\'autres habitants sur la santé au quotidien.',
  },
  {
    icon: Shield,
    title: 'Données protégées',
    desc: 'Vos informations sont chiffrées et ne quittent jamais l\'application.',
  },
  {
    icon: Clock,
    title: 'Rendez-vous simplifiés',
    desc: 'Prenez rendez-vous dans le centre de votre choix en quelques clics.',
  },
  {
    icon: Heart,
    title: 'Suivi grossesse',
    desc: 'Suivez votre grossesse semaine par semaine avec conseils personnalisés.',
  },
]
