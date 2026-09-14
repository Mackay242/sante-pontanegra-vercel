'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Eye, EyeOff, AlertCircle, Check, Stethoscope, Cross, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Role = 'USER' | 'DOCTOR' | 'NURSE'

const ROLE_OPTIONS: Array<{
  id: Role
  label: string
  description: string
  icon: React.ElementType
}> = [
  {
    id: 'USER',
    label: 'Patient',
    description: 'J\'utilise l\'app pour ma santé',
    icon: UserIcon,
  },
  {
    id: 'DOCTOR',
    label: 'Médecin',
    description: 'Je suis professionnel de santé',
    icon: Stethoscope,
  },
  {
    id: 'NURSE',
    label: 'Infirmier(ère)',
    description: 'Je suis personnel soignant',
    icon: Cross,
  },
]

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
  'Autre',
]

type FieldErrors = {
  name?: string[]
  phone?: string[]
  email?: string[]
  password?: string[]
  confirm?: string[]
  specialty?: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [role, setRole] = useState<Role>('USER')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    specialty: '',
    bio: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((fe) => ({ ...fe, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          role,
          specialty: role === 'USER' ? '' : form.specialty,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details as FieldErrors)
        } else {
          setError(data.message ?? 'Inscription impossible. Réessayez.')
        }
        return
      }
      await refresh()
      router.push('/dashboard')
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const passwordChecks = [
    { label: 'Min. 6 caractères', ok: form.password.length >= 6 },
    { label: 'Identique à la confirmation', ok: form.password === form.confirm && form.confirm.length > 0 },
  ]

  const isMedical = role === 'DOCTOR' || role === 'NURSE'

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-gradient">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-foreground">Santé Pontanegra</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <CardDescription>
              Inscrivez-vous gratuitement pour accéder à tous les services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role selection */}
              <div className="space-y-2">
                <Label>Je suis…</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const active = role === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRole(opt.id)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-xl border p-3 transition tap-feedback',
                          active
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-medium',
                            active ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ROLE_OPTIONS.find((o) => o.id === role)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={isMedical ? 'Dr. Marie Koumba' : 'Marie Koumba'}
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+242 06 000 0000"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.phone}
                />
                {fieldErrors.phone?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
                )}
              </div>

              {/* Specialty field for medical roles */}
              {isMedical && (
                <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <Label htmlFor="specialty">
                    Spécialité médicale <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="specialty"
                    required
                    value={form.specialty}
                    onChange={(e) => update('specialty', e.target.value)}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Sélectionnez votre spécialité…</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.specialty?.[0] && (
                    <p className="text-xs text-destructive">{fieldErrors.specialty[0]}</p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (optionnel)</Label>
                    <Textarea
                      id="bio"
                      rows={2}
                      placeholder="Présentez-vous en quelques mots…"
                      value={form.bio}
                      onChange={(e) => update('bio', e.target.value)}
                      disabled={loading}
                      maxLength={300}
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.bio.length}/300 caractères
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    disabled={loading}
                    className="pr-10"
                    aria-invalid={!!fieldErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={(e) => update('confirm', e.target.value)}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.confirm}
                />
                {fieldErrors.confirm?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.confirm[0]}</p>
                )}
              </div>

              <ul className="space-y-1">
                {passwordChecks.map((c) => (
                  <li
                    key={c.label}
                    className={cn(
                      'flex items-center gap-2 text-xs',
                      c.ok ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Check className={cn('h-3 w-3', c.ok ? 'opacity-100' : 'opacity-30')} />
                    {c.label}
                  </li>
                ))}
              </ul>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Création…' : 'Créer mon compte'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Déjà inscrit ?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </p>
            <Link href="/" className="hover:text-foreground">
              ← Retour à l&apos;accueil
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
