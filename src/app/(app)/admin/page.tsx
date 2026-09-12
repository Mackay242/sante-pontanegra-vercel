'use client'

import { useEffect, useState } from 'react'
import {
  Shield,
  Users as UsersIcon,
  Loader2,
  Mail,
  Phone,
  Save,
  Stethoscope,
  Cross,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingState, ErrorState } from '@/components/shared/states'
import { ROLE_LABELS, ROLE_COLORS, type Role } from '@/lib/roles'
import { useToast } from '@/hooks/use-toast'

type User = {
  id: string
  email: string
  name: string
  phone: string | null
  role: Role
  specialty: string | null
  createdAt: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<Role>('USER')
  const [editSpecialty, setEditSpecialty] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Erreur')
      setUsers(data.users)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(u: User) {
    setEditingId(u.id)
    setEditRole(u.role)
    setEditSpecialty(u.specialty ?? '')
  }

  async function saveEdit(id: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          specialty: editSpecialty,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: 'Erreur',
          description: data.message ?? 'Mise à jour impossible.',
          variant: 'destructive',
        })
        return
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data.user } : u))
      )
      setEditingId(null)
      toast({ title: 'Utilisateur mis à jour' })
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <>
        <AppHeader title="Administration" backHref="/dashboard" />
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-destructive" />
            <h3 className="mt-3 text-lg font-semibold">Accès refusé</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cette page est réservée aux administrateurs.
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title="Administration"
        subtitle="Gestion des utilisateurs et des rôles"
        backHref="/dashboard"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Utilisateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'DOCTOR').length}
                </p>
                <p className="text-xs text-muted-foreground">Médecins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Cross className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'NURSE').length}
                </p>
                <p className="text-xs text-muted-foreground">Infirmiers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <LoadingState message="Chargement des utilisateurs…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4">
                {editingId === u.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`role-${u.id}`}>Rôle</Label>
                        <Select
                          value={editRole}
                          onValueChange={(v) => setEditRole(v as Role)}
                        >
                          <SelectTrigger id={`role-${u.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">Utilisateur</SelectItem>
                            <SelectItem value="NURSE">Infirmier(ère)</SelectItem>
                            <SelectItem value="DOCTOR">Médecin</SelectItem>
                            <SelectItem value="ADMIN">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`specialty-${u.id}`}>
                          Spécialité (médecin/infirmier)
                        </Label>
                        <Input
                          id={`specialty-${u.id}`}
                          placeholder="Ex : Pédiatrie, Cardiologie…"
                          value={editSpecialty}
                          onChange={(e) => setEditSpecialty(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(u.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-1 h-4 w-4" />
                        )}
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-gradient text-sm font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{u.name}</p>
                          <Badge
                            className={`text-xs ${ROLE_COLORS[u.role]}`}
                            variant="secondary"
                          >
                            {ROLE_LABELS[u.role]}
                          </Badge>
                          {u.specialty && (
                            <span className="text-xs text-muted-foreground">
                              · {u.specialty}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {u.phone}
                            </div>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Inscrit le{' '}
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(u)}
                    >
                      Modifier
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
