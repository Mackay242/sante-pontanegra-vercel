'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Save,
  Loader2,
  Plus,
  X,
  Heart,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState } from '@/components/shared/states'
import { useToast } from '@/hooks/use-toast'

type Dossier = {
  id: string
  groupeSanguin: string | null
  allergies: string[]
  maladiesChroniques: string[]
  antecedents: string[]
  medicamentsActuels: string[]
}

const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu']

export default function DossierPage() {
  const { toast } = useToast()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [newItem, setNewItem] = useState<Record<string, string>>({
    allergies: '',
    maladiesChroniques: '',
    antecedents: '',
    medicamentsActuels: '',
  })

  useEffect(() => {
    loadDossier()
  }, [])

  async function loadDossier() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dossier', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDossier(data.dossier)
    } catch {
      setError('Impossible de charger votre dossier.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!dossier) return
    setSaving(true)
    try {
      const res = await fetch('/api/dossier', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dossier),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Dossier enregistré', description: 'Vos informations sont à jour.' })
    } catch {
      toast({ title: 'Erreur', description: 'Enregistrement impossible.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function addItem(field: keyof typeof newItem) {
    const val = newItem[field].trim()
    if (!val || !dossier) return
    setDossier({
      ...dossier,
      [field]: [...dossier[field], val],
    })
    setNewItem((n) => ({ ...n, [field]: '' }))
  }

  function removeItem(field: keyof Dossier, idx: number) {
    if (!dossier) return
    setDossier({
      ...dossier,
      [field]: (dossier[field] as string[]).filter((_, i) => i !== idx),
    })
  }

  if (loading) return <LoadingState message="Chargement du dossier…" />
  if (error || !dossier)
    return <ErrorState message={error ?? undefined} onRetry={loadDossier} />

  return (
    <>
      <AppHeader
        title="Dossier médical"
        subtitle="Vos informations de santé essentielles"
        backHref="/dashboard"
      />

      <div className="space-y-6">
        {/* Groupe sanguin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-destructive" />
              Groupe sanguin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GROUPES.map((g) => (
                <Button
                  key={g}
                  size="sm"
                  variant={dossier.groupeSanguin === g ? 'default' : 'outline'}
                  onClick={() =>
                    setDossier({
                      ...dossier,
                      groupeSanguin: dossier.groupeSanguin === g ? null : g,
                    })
                  }
                >
                  {g}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List sections */}
        <ListSection
          title="Allergies"
          icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
          items={dossier.allergies}
          newItem={newItem.allergies}
          onNewItemChange={(v) => setNewItem((n) => ({ ...n, allergies: v }))}
          onAdd={() => addItem('allergies')}
          onRemove={(i) => removeItem('allergies', i)}
        />
        <ListSection
          title="Maladies chroniques"
          icon={<FileText className="h-4 w-4 text-primary" />}
          items={dossier.maladiesChroniques}
          newItem={newItem.maladiesChroniques}
          onNewItemChange={(v) =>
            setNewItem((n) => ({ ...n, maladiesChroniques: v }))
          }
          onAdd={() => addItem('maladiesChroniques')}
          onRemove={(i) => removeItem('maladiesChroniques', i)}
        />
        <ListSection
          title="Antécédents médicaux"
          icon={<FileText className="h-4 w-4 text-primary" />}
          items={dossier.antecedents}
          newItem={newItem.antecedents}
          onNewItemChange={(v) => setNewItem((n) => ({ ...n, antecedents: v }))}
          onAdd={() => addItem('antecedents')}
          onRemove={(i) => removeItem('antecedents', i)}
        />
        <ListSection
          title="Médicaments actuels"
          icon={<FileText className="h-4 w-4 text-primary" />}
          items={dossier.medicamentsActuels}
          newItem={newItem.medicamentsActuels}
          onNewItemChange={(v) =>
            setNewItem((n) => ({ ...n, medicamentsActuels: v }))
          }
          onAdd={() => addItem('medicamentsActuels')}
          onRemove={(i) => removeItem('medicamentsActuels', i)}
        />

        <div className="sticky bottom-20 lg:bottom-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full shadow-lg lg:w-auto"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer le dossier
          </Button>
        </div>
      </div>
    </>
  )
}

function ListSection({
  title,
  icon,
  items,
  newItem,
  onNewItemChange,
  onAdd,
  onRemove,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  newItem: string
  onNewItemChange: (v: string) => void
  onAdd: () => void
  onRemove: (idx: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun élément</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="flex items-center gap-1 py-1.5 pl-3 pr-1"
              >
                <span>{item}</span>
                <button
                  onClick={() => onRemove(i)}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label="Retirer"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder={`Ajouter un élément…`}
            value={newItem}
            onChange={(e) => onNewItemChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onAdd()
              }
            }}
          />
          <Button type="button" size="icon" onClick={onAdd} disabled={!newItem.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
