'use client'

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
  BellRing,
  BellOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { useAuth } from '@/components/auth-provider'
import { usePushNotifications } from '@/hooks/use-push'
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

import { useEffect, useState } from 'react'

export default function ParametresPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const [notifications, setNotifications] = useState(true)
  const push = usePushNotifications()
  const [testSent, setTestSent] = useState(false)

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  async function handleEnablePush() {
    const ok = await push.subscribe()
    if (ok) setTestSent(false)
  }

  async function handleTestPush() {
    const ok = await push.sendTest()
    if (ok) setTestSent(true)
  }

  return (
    <>
      <AppHeader
        title="Paramètres"
        subtitle="Personnalisez votre expérience"
        backHref="/dashboard"
      />

      <div className="space-y-6">
        {/* Apparence */}
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

        {/* Notifications Push */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notifications Push
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {push.status === 'unsupported' && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Votre navigateur ne supporte pas les notifications push.
                </span>
              </div>
            )}

            {push.status === 'configured-false' && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Notifications non activées sur ce serveur</p>
                  <p className="mt-1 text-xs">
                    L&apos;administrateur doit configurer les clés VAPID
                    (voir .env.example) pour activer les notifications push.
                  </p>
                </div>
              </div>
            )}

            {(push.status === 'default' || push.status === 'granted') && (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <BellRing className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Recevoir des rappels</p>
                    <p className="text-xs text-muted-foreground">
                      Rendez-vous, vaccinations, suivi grossesse
                    </p>
                  </div>
                </div>

                {push.status === 'default' && (
                  <Button
                    onClick={handleEnablePush}
                    disabled={push.loading}
                    className="w-full"
                  >
                    {push.loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="mr-2 h-4 w-4" />
                    )}
                    Activer les notifications
                  </Button>
                )}

                {push.status === 'granted' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Notifications activées sur cet appareil
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestPush}
                      disabled={push.loading}
                      className="w-full"
                    >
                      {push.loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BellRing className="mr-2 h-4 w-4" />
                      )}
                      Envoyer une notification de test
                    </Button>
                    {testSent && (
                      <p className="text-center text-xs text-muted-foreground">
                        ✅ Notification envoyée ! Vérifiez votre navigateur.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {push.status === 'denied' && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <BellOff className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Les notifications ont été refusées. Réinitialisez-les dans
                  les paramètres de votre navigateur.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Préférences */}
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
                  <p className="text-sm font-medium">Rappels par email</p>
                  <p className="text-xs text-muted-foreground">
                    (bientôt disponible)
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

        {/* Compte */}
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
          Santé Pontanegra · v1.1.0 · Pointe-Noire, Congo
        </p>
      </div>
    </>
  )
}
