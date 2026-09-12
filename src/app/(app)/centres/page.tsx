'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Navigation,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { CENTRES, type Centre } from '@/lib/data/centres'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TYPE_FILTERS: Array<{ key: Centre['type'] | 'Tous'; label: string }> = [
  { key: 'Tous', label: 'Tous' },
  { key: 'Hôpital', label: 'Hôpitaux' },
  { key: 'Clinique', label: 'Cliniques' },
  { key: 'CSI', label: 'Centres de santé' },
]

export default function CentresPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]['key']>('Tous')

  const filtered = useMemo(() => {
    return CENTRES.filter((c) => {
      const matchesQuery =
        !query ||
        c.nom.toLowerCase().includes(query.toLowerCase()) ||
        c.quartier.toLowerCase().includes(query.toLowerCase()) ||
        c.adresse.toLowerCase().includes(query.toLowerCase())
      const matchesType = typeFilter === 'Tous' || c.type === typeFilter
      return matchesQuery && matchesType
    })
  }, [query, typeFilter])

  return (
    <>
      <AppHeader
        title="Centres de santé"
        subtitle="Hôpitaux, cliniques et CSI de Pointe-Noire"
      />

      {/* Search */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, quartier, adresse…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={typeFilter === f.key ? 'default' : 'outline'}
              onClick={() => setTypeFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c) => (
          <Card key={c.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{c.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground">{c.adresse}</p>
                </div>
                <Badge variant={c.urgences ? 'destructive' : 'secondary'}>
                  {c.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Quartier {c.quartier}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{c.horaires}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a
                  href={`tel:${c.tel.replace(/\s/g, '')}`}
                  className="font-medium text-primary hover:underline"
                >
                  {c.tel}
                </a>
              </div>
              {c.urgences && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Urgences 24h/24</span>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="default">
                  <Link href={`/rendezvous?centre=${c.id}`}>Prendre RDV</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="mr-1 h-4 w-4" />
                    Itinéraire
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              Aucun centre ne correspond à votre recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
