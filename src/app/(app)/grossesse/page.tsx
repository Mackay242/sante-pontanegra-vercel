'use client'

import { useEffect, useState } from 'react'
import {
  Baby,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  Heart,
  Activity,
  Info,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
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

type Pregnancy = {
  id: string
  startDate: string
  expectedBirth: string
  weeks: number
  notes: string | null
}

export default function GrossessePage() {
  const { toast } = useToast()
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    startDate: '',
    expectedBirth: '',
    notes: '',
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pregnancies', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPregnancies(data.pregnancies)
    } catch {
      setError('Impossible de charger vos suivis.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/pregnancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setPregnancies((p) => [data.pregnancy, ...p])
      setForm({ startDate: '', expectedBirth: '', notes: '' })
      setDialogOpen(false)
      toast({ title: 'Suivi créé', description: 'Votre suivi de grossesse a commencé.' })
    } catch {
      toast({ title: 'Erreur', description: 'Création impossible.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce suivi de grossesse ?')) return
    // Not implemented in API; for now just optimistic remove
    setPregnancies((p) => p.filter((pr) => pr.id !== id))
  }

  return (
    <>
      <AppHeader
        title="Suivi grossesse"
        subtitle="Votre grossesse, semaine par semaine"
        backHref="/dashboard"
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pregnancies.length} suivi{pregnancies.length > 1 ? 's' : ''}
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nouveau suivi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Démarrer un suivi de grossesse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Premier jour des dernières règles</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedBirth">Date prévue de l&apos;accouchement</Label>
                <Input
                  id="expectedBirth"
                  type="date"
                  required
                  value={form.expectedBirth}
                  onChange={(e) => setForm((f) => ({ ...f, expectedBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Informations importantes, symptômes, etc."
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
                  Démarrer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingState message="Chargement…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : pregnancies.length === 0 ? (
        <EmptyState
          title="Aucun suivi actif"
          description="Démarrez un suivi de grossesse pour suivre l'évolution semaine par semaine."
          icon={<Baby className="h-5 w-5" />}
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Démarrer un suivi
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {pregnancies.map((p) => {
            const start = new Date(p.startDate)
            const expected = new Date(p.expectedBirth)
            const totalWeeks = 40
            const currentWeeks = Math.max(0, Math.min(40, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 7))))
            const progress = (currentWeeks / totalWeeks) * 100
            const trimester = currentWeeks < 13 ? 1 : currentWeeks < 27 ? 2 : 3
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Baby className="h-4 w-4 text-primary" />
                      </div>
                      Semaine {currentWeeks}
                    </CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Trimestre {trimester}</span>
                      <span>{currentWeeks}/{totalWeeks} semaines</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Début
                      </div>
                      <p className="mt-1 font-medium">
                        {start.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        Accouchement
                      </div>
                      <p className="mt-1 font-medium">
                        {expected.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {p.notes && (
                    <div className="rounded-lg border p-3 text-sm">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="mt-1">{p.notes}</p>
                    </div>
                  )}

                  <Card className="border-primary/20 bg-medical-gradient-soft">
                    <CardContent className="flex gap-3 py-3">
                      <Activity className="h-4 w-4 flex-shrink-0 text-primary" />
                      <p className="text-sm">
                        {trimester === 1 &&
                          '1er trimestre : développement des organes vitaux. Évitez l\'alcool, le tabac et certains aliments.'}
                        {trimester === 2 &&
                          '2e trimestre : bébé grandit vite. Vous sentirez ses mouvements. Consultez mensuellement.'}
                        {trimester === 3 &&
                          '3e trimestre : préparez votre sac pour la maternité. Consultez toutes les 2 semaines.'}
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-6 border-primary/30">
        <CardContent className="flex gap-3 py-4">
          <Info className="h-5 w-5 flex-shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Important</p>
            <p className="mt-1">
              Ce suivi est informatif et ne remplace pas les consultations prénatales.
              Consultez mensuellement un centre de santé de Pointe-Noire.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
