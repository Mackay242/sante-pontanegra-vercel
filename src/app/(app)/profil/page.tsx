'use client'

import { useRouter } from 'next/navigation'
import {
  User as UserIcon,
  Mail,
  Phone,
  LogOut,
  Settings,
  ChevronRight,
  Heart,
  Shield,
  Stethoscope,
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
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/roles'

export default function ProfilPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  if (!user) return null

  return (
    <>
      <AppHeader title="Profil" subtitle="Vos informations personnelles" />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-medical-gradient text-3xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge
              className={`mt-2 ${
                user.role === 'ADMIN'
                  ? 'bg-destructive/10 text-destructive'
                  : user.role === 'DOCTOR'
                  ? 'bg-primary/10 text-primary'
                  : user.role === 'NURSE'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-muted text-muted-foreground'
              }`}
              variant="secondary"
            >
              {user.role === 'ADMIN' && <Shield className="mr-1 h-3 w-3" />}
              {user.role === 'DOCTOR' && (
                <Stethoscope className="mr-1 h-3 w-3" />
              )}
              {ROLE_LABELS[user.role]}
            </Badge>
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-primary" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={UserIcon} label="Nom" value={user.name} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow
                icon={Phone}
                label="Téléphone"
                value="Non renseigné"
              />
              <InfoRow
                icon={Heart}
                label="Rôle"
                value={ROLE_LABELS[user.role]}
              />
            </CardContent>
          </Card>

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
