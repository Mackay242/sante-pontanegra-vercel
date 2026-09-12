'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Moon,
  Sun,
  Bell,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Info,
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
import { Switch } from '@/components/ui/switch'

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

export default function ParametresPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const [notifications, setNotifications] = useState(true)

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <>
      <AppHeader
        title="Paramètres"
        subtitle="Personnalisez votre expérience"
        backHref="/dashboard"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apparence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {mounted && theme === 'dark' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">
                    Adapté à la lecture nocturne
                  </p>
                </div>
              </div>
              <Switch
                checked={mounted && theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Préférences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Rappels RDV, vaccins, grossesse
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => router.push('/parametres/legal')}
            >
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                Mentions légales
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => router.push('/parametres/legal')}
            >
              <span className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                Confidentialité
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => router.push('/parametres/legal')}
            >
              <span className="flex items-center gap-3">
                <Info className="h-4 w-4" />
                À propos
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </span>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Santé Pontanegra · v1.0.0 · Pointe-Noire, Congo
        </p>
      </div>
    </>
  )
}
