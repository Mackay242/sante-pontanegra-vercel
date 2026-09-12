'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EmptyState, LoadingState, ErrorState } from '@/components/shared/states'
import { useToast } from '@/hooks/use-toast'
import { CENTRES } from '@/lib/data/centres'

type Appointment = {
  id: string
  centreId: string
  centreName: string
  date: string
  motif: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
}

const STATUS_LABELS: Record<Appointment['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  confirmed: { label: 'Confirmé', variant: 'default' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
  completed: { label: 'Terminé', variant: 'outline' },
}

function RendezVousContent() {
  const searchParams = useSearchParams()
  const preselectedCentreId = searchParams.get('centre')
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    centreId: preselectedCentreId ?? '',
    date: '',
    motif: '',
    notes: '',
  })

  useEffect(() => {
    if (preselectedCentreId) setDialogOpen(true)
  }, [preselectedCentreId])

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/appointments', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAppointments(data.appointments)
    } catch {
      setError('Impossible de charger vos rendez-vous.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const centre = CENTRES.find((c) => c.id === form.centreId)
    if (!centre || !form.date || !form.motif) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs requis.',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centreId: centre.id,
          centreName: centre.nom,
          date: form.date,
          motif: form.motif,
          notes: form.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: 'Erreur',
          description: data.message ?? 'Prise de rendez-vous impossible.',
          variant: 'destructive',
        })
        return
      }
      setAppointments((a) => [...a, data.appointment])
      setForm({ centreId: '', date: '', motif: '', notes: '' })
      setDialogOpen(false)
      toast({ title: 'Rendez-vous pris', description: 'Nous vous contacterons pour confirmation.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatus(id: string, status: Appointment['status']) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      )
    } catch {
      toast({ title: 'Erreur', description: 'Mise à jour impossible.', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Annuler ce rendez-vous ?')) return
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } catch {
      toast({ title: 'Erreur', description: 'Suppression impossible.', variant: 'destructive' })
    }
  }

  return (
    <>
      <AppHeader
        title="Rendez-vous"
        subtitle="Vos rendez-vous médicaux"
        backHref="/dashboard"
      />

      <div className="mb-4 flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nouveau RDV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prendre un rendez-vous</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="centre">Centre de santé</Label>
                <select
                  id="centre"
                  required
                  value={form.centreId}
                  onChange={(e) => setForm((f) => ({ ...f, centreId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sélectionner un centre…</option>
                  {CENTRES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} — {c.quartier}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date et heure</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motif">Motif</Label>
                <Input
                  id="motif"
                  placeholder="Ex : Consultation de routine, fièvre…"
                  required
                  value={form.motif}
                  onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Précisions pour le médecin…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-1 h-4 w-4" />
                  )}
                  Confirmer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingState message="Chargement…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAppointments} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="Aucun rendez-vous"
          description="Prenez votre premier rendez-vous dans un centre de santé de Pointe-Noire."
          icon={<Calendar className="h-5 w-5" />}
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Prendre rendez-vous
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const status = STATUS_LABELS[a.status]
            const date = new Date(a.date)
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{a.centreName}</h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {date.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {date.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <p className="mt-1 text-sm">{a.motif}</p>
                    {a.notes && (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        « {a.notes} »
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {a.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatus(a.id, 'cancelled')}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Annuler
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(a.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

export default function RendezVousPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RendezVousContent />
    </Suspense>
  )
}
