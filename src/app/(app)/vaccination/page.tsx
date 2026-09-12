'use client'

import { useEffect, useState } from 'react'
import {
  Syringe,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  Info,
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

type Vaccination = {
  id: string
  vaccine: string
  date: string
  nextDue: string | null
  notes: string | null
}

const RECOMMENDED_VACCINES = [
  'BCG (Tuberculose)',
  'VPO (Poliomyélite)',
  'DTCoq (Diphtérie, Tétanos, Coqueluche)',
  'Rougeole (VAR)',
  'Fièvre jaune',
  'Hépatite B',
  'Pneumocoque',
  'Méningocoque',
  'COVID-19',
  'Grippe saisonnière',
]

export default function VaccinationPage() {
  const { toast } = useToast()
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    vaccine: '',
    date: '',
    nextDue: '',
    notes: '',
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/vaccinations', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVaccinations(data.vaccinations)
    } catch {
      setError('Impossible de charger vos vaccins.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vaccine || !form.date) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setVaccinations((v) => [data.vaccination, ...v])
      setForm({ vaccine: '', date: '', nextDue: '', notes: '' })
      setDialogOpen(false)
      toast({ title: 'Vaccin enregistré', description: 'Votre carnet est à jour.' })
    } catch {
      toast({ title: 'Erreur', description: 'Enregistrement impossible.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce vaccin ?')) return
    try {
      const res = await fetch(`/api/vaccinations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setVaccinations((v) => v.filter((vac) => vac.id !== id))
    } catch {
      toast({ title: 'Erreur', description: 'Suppression impossible.', variant: 'destructive' })
    }
  }

  return (
    <>
      <AppHeader
        title="Vaccination"
        subtitle="Votre carnet vaccinal numérique"
        backHref="/dashboard"
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {vaccinations.length} vaccin{vaccinations.length > 1 ? 's' : ''} enregistré{vaccinations.length > 1 ? 's' : ''}
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un vaccin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vaccine">Vaccin</Label>
                <Input
                  id="vaccine"
                  list="vaccines"
                  required
                  placeholder="Ex : BCG, Fièvre jaune…"
                  value={form.vaccine}
                  onChange={(e) => setForm((f) => ({ ...f, vaccine: e.target.value }))}
                />
                <datalist id="vaccines">
                  {RECOMMENDED_VACCINES.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDue">Prochaine dose (optionnel)</Label>
                <Input
                  id="nextDue"
                  type="date"
                  value={form.nextDue}
                  onChange={(e) => setForm((f) => ({ ...f, nextDue: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Numéro de lot, médecin…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 border-primary/30 bg-medical-gradient-soft">
        <CardContent className="flex gap-3 py-4">
          <Info className="h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Conservez votre carnet vaccinal à jour. Il est essentiel pour
            voyager, scolariser vos enfants et prévenir les épidémies.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState message="Chargement du carnet…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : vaccinations.length === 0 ? (
        <EmptyState
          title="Aucun vaccin enregistré"
          description="Ajoutez vos vaccins pour suivre votre carnet de santé."
          icon={<Syringe className="h-5 w-5" />}
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un vaccin
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {vaccinations.map((v) => {
            const date = new Date(v.date)
            const next = v.nextDue ? new Date(v.nextDue) : null
            const dueSoon =
              next && (next.getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000
            return (
              <Card key={v.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Syringe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{v.vaccine}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString('fr-FR')}
                        </div>
                        {next && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Prochain : {next.toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                      {v.notes && (
                        <p className="mt-1 text-xs italic text-muted-foreground">
                          « {v.notes} »
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {dueSoon && (
                      <Badge variant="destructive">Bientôt dû</Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(v.id)}
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
