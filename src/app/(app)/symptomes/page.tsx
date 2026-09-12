'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Thermometer,
  Activity,
  Brain,
  Bone,
  Wind,
  Droplet,
  Baby,
  ArrowRight,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Symptom = {
  id: string
  label: string
  icon: React.ElementType
  color: string
  advice: string
  severity: 'low' | 'medium' | 'high'
}

const SYMPTOMS: Symptom[] = [
  {
    id: 'fever',
    label: 'Fièvre',
    icon: Thermometer,
    color: 'text-destructive',
    advice: 'Buvez beaucoup d\'eau, reposez-vous. Pensez au test de paludisme si la fièvre dépasse 39°C ou dure plus de 3 jours. Prenez du paracétamol.',
    severity: 'medium',
  },
  {
    id: 'cough',
    label: 'Toux',
    icon: Wind,
    color: 'text-secondary',
    advice: 'Hydratez-vous, reposez votre voix. Si elle persiste plus d\'une semaine, s\'accompagne de sang ou de difficultés respiratoires, consultez un médecin.',
    severity: 'low',
  },
  {
    id: 'headache',
    label: 'Maux de tête',
    icon: Brain,
    color: 'text-amber-500',
    advice: 'Reposez-vous, buvez de l\'eau. En cas de maux soudains et intenses, ou avec troubles visuels, consultez en urgence.',
    severity: 'medium',
  },
  {
    id: 'stomach',
    label: 'Mal de ventre',
    icon: Droplet,
    color: 'text-secondary',
    advice: 'Hydratez-vous avec une solution de réhydratation orale. Consultez si vous observez du sang, une fièvre élevée ou une déshydratation.',
    severity: 'medium',
  },
  {
    id: 'fatigue',
    label: 'Fatigue intense',
    icon: Activity,
    color: 'text-amber-500',
    advice: 'Reposez-vous. Une fatigue persistante peut révéler une anémie ou une infection. Faites un bilan si elle dure plus de 2 semaines.',
    severity: 'low',
  },
  {
    id: 'joint',
    label: 'Douleurs articulaires',
    icon: Bone,
    color: 'text-secondary',
    advice: 'Repos, application de froid. Si gonflement ou fièvre, consultez (possible arthrite ou infection).',
    severity: 'low',
  },
  {
    id: 'pregnancy',
    label: 'Suivi grossesse',
    icon: Baby,
    color: 'text-primary',
    advice: 'Consultation mensuelle obligatoire. Signes d\'alerte : saignements, fortes douleurs, fièvre — consultez en urgence.',
    severity: 'medium',
  },
]

const SEVERITY_LABELS = {
  low: { label: 'Léger', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Modéré', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export default function SymptomesPage() {
  const [selected, setSelected] = useState<Symptom | null>(null)

  return (
    <>
      <AppHeader
        title="Symptômes"
        subtitle="Reconnaissez les symptômes courants et agissez"
        backHref="/dashboard"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SYMPTOMS.map((s) => {
          const Icon = s.icon
          const sev = SEVERITY_LABELS[s.severity]
          return (
            <Card
              key={s.id}
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => setSelected(s)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sev.color}`}>
                    {sev.label}
                  </span>
                </div>
                <CardTitle className="mt-2 text-base">{s.label}</CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {selected && (
        <Card className="mt-6 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <selected.icon className={`h-5 w-5 ${selected.color}`} />
              {selected.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected.advice}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/medecin">
                  Parler à un médecin
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/centres">Trouver un centre</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-destructive/30 bg-destructive/5">
        <CardContent className="py-4">
          <p className="text-sm font-medium text-destructive">
            En cas d&apos;urgence vitale
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Appelez immédiatement le <strong className="text-destructive">118</strong>{' '}
            (SAMU/Pompiers) ou le{' '}
            <strong className="text-destructive">117</strong> (Police Secours).
          </p>
        </CardContent>
      </Card>
    </>
  )
}
