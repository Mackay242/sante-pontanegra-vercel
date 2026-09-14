'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Stethoscope,
  Search,
  MessageCircle,
  ChevronRight,
  Loader2,
  Filter,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { EmptyState, LoadingState, ErrorState } from '@/components/shared/states'
import { RoleBadge } from '@/components/shared/role-badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/roles'

type Doctor = {
  id: string
  name: string
  email: string
  role: Role
  specialty: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  followersCount: number
  postsCount: number
  consultationsCount: number
}

const SPECIALTIES = [
  'Généraliste',
  'Pédiatrie',
  'Cardiologie',
  'Gynécologie',
  'Chirurgie',
  'Urgences',
  'Dermatologie',
  'Neurologie',
  'Psychiatrie',
  'Infirmier(ère)',
]

export default function MedecinsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState('all')
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const [consulting, setConsulting] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/doctors', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDoctors(data.doctors)
      setSpecialties(data.specialties ?? [])
      setFollowingIds(data.followingIds ?? [])
      const followingMap: Record<string, boolean> = {}
      data.doctors.forEach((d: Doctor) => {
        followingMap[d.id] = (data.followingIds ?? []).includes(d.id)
      })
      setFollowing(followingMap)
    } catch {
      setError('Impossible de charger la liste des médecins.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow(doctorId: string) {
    try {
      const res = await fetch(`/api/users/${doctorId}/follow`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setFollowing((f) => ({ ...f, [doctorId]: data.following }))
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? {
                ...d,
                followersCount: d.followersCount + (data.following ? 1 : -1),
              }
            : d
        )
      )
      toast({
        title: data.following ? 'Abonné !' : 'Désabonné',
      })
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  async function handleConsult(doctorId: string) {
    setConsulting(doctorId)
    try {
      const res = await fetch(`/api/consultations/doctor/${doctorId}`, {
        method: 'GET',
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      toast({ title: 'Consultation ouverte', description: 'Vous pouvez discuter avec le médecin.' })
      router.push(`/consultation/${doctorId}`)
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir la consultation.',
        variant: 'destructive',
      })
    } finally {
      setConsulting(null)
    }
  }

  const filtered = doctors.filter((d) => {
    const matchesQuery =
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      (d.specialty ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (d.bio ?? '').toLowerCase().includes(query.toLowerCase())
    const matchesSpecialty =
      activeSpecialty === 'all' ||
      (d.specialty ?? '').toLowerCase().includes(activeSpecialty.toLowerCase())
    return matchesQuery && matchesSpecialty
  })

  return (
    <>
      <AppHeader
        title="Annuaire médical"
        subtitle="Trouvez un médecin par spécialité et consultez en privé"
        backHref="/dashboard"
      />

      {/* Search */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, spécialité ou bio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Specialty filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <Button
            size="sm"
            variant={activeSpecialty === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveSpecialty('all')}
            className="whitespace-nowrap"
          >
            Tous
          </Button>
          {SPECIALTIES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={activeSpecialty === s ? 'default' : 'outline'}
              onClick={() => setActiveSpecialty(s)}
              className="whitespace-nowrap"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Chargement du personnel médical…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun médecin trouvé"
          description="Essayez une autre spécialité ou un autre terme de recherche."
          icon={<Stethoscope className="h-5 w-5" />}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-medical-gradient text-lg font-bold text-white',
                      d.role === 'DOCTOR' && 'ring-2 ring-primary ring-offset-2',
                      d.role === 'NURSE' && 'ring-2 ring-blue-500 ring-offset-2'
                    )}
                  >
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{d.name}</span>
                      <RoleBadge role={d.role} specialty={d.specialty} />
                    </div>
                    {d.bio && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {d.bio}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>👥 {d.followersCount} abonné{d.followersCount > 1 ? 's' : ''}</span>
                      <span>💬 {d.postsCount} publications</span>
                      <span>🩺 {d.consultationsCount} consultation{d.consultationsCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConsult(d.id)}
                        disabled={consulting === d.id || d.id === user?.id}
                      >
                        {consulting === d.id ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <MessageCircle className="mr-1 h-4 w-4" />
                        )}
                        Consulter
                      </Button>
                      <Button
                        size="sm"
                        variant={following[d.id] ? 'default' : 'outline'}
                        onClick={() => handleFollow(d.id)}
                        disabled={d.id === user?.id}
                      >
                        {following[d.id] ? '✓ Suivi' : '+ Suivre'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
