'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Calendar,
  Heart,
  Pill,
  Syringe,
  Stethoscope,
  Video,
  Users,
  FileText,
  Baby,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { AppHeader } from '@/components/layout/navbar'
import { ServiceCard } from '@/components/shared/service-card'
import { EmergencyCard } from '@/components/shared/emergency-card'
import { AdCarousel, SponsorCarousel } from '@/components/shared/carousel'
import { ADS, SPONSORS, SERVICES } from '@/lib/data/app'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { user } = useAuth()
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h < 11 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
  }, [])

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <>
      <AppHeader
        title={`${greeting}${firstName ? `, ${firstName}` : ''} 👋`}
        subtitle="Voici votre espace santé personnel à Pointe-Noire."
      />

      {/* Hero card */}
      <div className="mb-6 rounded-3xl bg-medical-gradient p-6 text-white shadow-sm md:p-8">
        <p className="text-sm font-medium text-white/90">Votre santé aujourd&apos;hui</p>
        <h2 className="mt-1 text-2xl font-bold md:text-3xl">
          Pensez à votre bien-être au quotidien
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/85">
          Prenez rendez-vous, consultez vos informations médicales, et échangez
          avec notre assistant. Tout est centralisé ici.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/rendezvous"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow hover:bg-white/90"
          >
            Prendre rendez-vous
          </Link>
          <Link
            href="/medecin"
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
          >
            Parler à un médecin
          </Link>
        </div>
      </div>

      {/* Services grid */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Services</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <ServiceCard key={s.key} service={s} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <EmergencyCard />

        {/* Panneau publicitaire défilant */}
        <div className="group relative">
          <AdCarousel ads={ADS} />
        </div>

        {/* Panneau sponsors défilant */}
        <div className="group relative">
          <SponsorCarousel sponsors={SPONSORS} />
        </div>

        {/* Quick stats */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Vos raccourcis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition hover:border-primary hover:shadow-sm"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium">{s.label}</span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

const SHORTCUTS = [
  { label: 'Vidéos', href: '/videos', icon: Video },
  { label: 'Communauté', href: '/communaute', icon: Users },
  { label: 'Dossier', href: '/dossier', icon: FileText },
  { label: 'RDV', href: '/rendezvous', icon: Calendar },
  { label: 'Vaccins', href: '/vaccination', icon: Syringe },
  { label: 'Grossesse', href: '/grossesse', icon: Baby },
  { label: 'Centres', href: '/centres', icon: Heart },
  { label: 'Médecin', href: '/medecin', icon: Stethoscope },
]
