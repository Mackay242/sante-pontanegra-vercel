'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User as UserIcon,
  Mail,
  Phone,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
  Stethoscope,
  Edit,
  Save,
  Loader2,
  MessageSquare,
  Heart,
  Users,
  Check,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { useAuth } from '@/components/auth-provider'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RoleBadge, RoleAvatar } from '@/components/shared/role-badge'
import { ROLE_LABELS } from '@/lib/roles'
import { useToast } from '@/hooks/use-toast'

type Profile = {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'USER' | 'NURSE' | 'DOCTOR' | 'ADMIN'
  specialty: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
}

type Stats = {
  postsCount: number
  followersCount: number
  followingCount: number
  commentsCount: number
  thanksReceived: number
}

export default function ProfilPage() {
  const { user, logout, refresh } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    specialty: '',
    avatarUrl: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setProfile(data.profile)
      setStats(data.stats)
      setForm({
        name: data.profile.name ?? '',
        phone: data.profile.phone ?? '',
        bio: data.profile.bio ?? '',
        specialty: data.profile.specialty ?? '',
        avatarUrl: data.profile.avatarUrl ?? '',
      })
    } catch {
      // ignore
    }
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      setProfile(data.profile)
      setEditing(false)
      await refresh()
      toast({ title: 'Profil mis à jour !' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const isMedical = user.role === 'DOCTOR' || user.role === 'NURSE'

  return (
    <>
      <AppHeader title="Profil" subtitle="Vos informations personnelles" />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile card */}
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <RoleAvatar
              name={profile?.name ?? user.name}
              role={user.role}
              avatarUrl={profile?.avatarUrl}
              size="lg"
            />
            <h2 className="mt-4 text-xl font-bold">{profile?.name ?? user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={user.role} specialty={profile?.specialty} />
              {profile?.specialty && (
                <Badge variant="outline" className="text-xs">
                  {profile.specialty}
                </Badge>
              )}
            </div>
            {profile?.bio && (
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            {stats && (
              <div className="mt-6 grid w-full grid-cols-3 gap-2 border-t pt-4">
                <Stat label="Posts" value={stats.postsCount} />
                <Stat label="Abonnés" value={stats.followersCount} />
                <Stat label="Merci" value={stats.thanksReceived} icon="🙏" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-2">
          {/* Edit / Info card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-primary" />
                {editing ? 'Modifier le profil' : 'Informations'}
              </CardTitle>
              {!editing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+242 06 000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (public)</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                      placeholder="Présentez-vous en quelques mots…"
                      maxLength={300}
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.bio.length}/300 caractères
                    </p>
                  </div>
                  {isMedical && (
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Spécialité médicale</Label>
                      <Input
                        id="specialty"
                        value={form.specialty}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, specialty: e.target.value }))
                        }
                        placeholder="Ex: Pédiatrie, Cardiologie…"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">URL photo de profil (optionnel)</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      value={form.avatarUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, avatarUrl: e.target.value }))
                      }
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-4 w-4" />
                      )}
                      Enregistrer
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={UserIcon} label="Nom" value={profile?.name ?? user.name} />
                  <InfoRow icon={Mail} label="Email" value={user.email} />
                  <InfoRow
                    icon={Phone}
                    label="Téléphone"
                    value={profile?.phone ?? 'Non renseigné'}
                  />
                  {isMedical && profile?.specialty && (
                    <InfoRow
                      icon={Stethoscope}
                      label="Spécialité"
                      value={profile.specialty}
                    />
                  )}
                  <InfoRow
                    icon={Heart}
                    label="Rôle"
                    value={ROLE_LABELS[user.role]}
                  />
                  {profile?.bio && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Bio</p>
                      <p className="mt-1 text-sm">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.role === 'ADMIN' && (
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => router.push('/admin')}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Panneau d&apos;administration
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => router.push('/parametres')}
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon?: string
}) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
