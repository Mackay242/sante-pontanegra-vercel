import { Bell, Calendar, Syringe, Baby, Stethoscope } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ALERTS = [
  {
    id: 1,
    type: 'rdv',
    title: 'Rappel rendez-vous',
    message: 'Vous avez un rendez-vous demain à 09h00 à l\'Hôpital Général de Pointe-Noire.',
    date: '2026-09-13',
    icon: Calendar,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 2,
    type: 'vaccin',
    title: 'Vaccin bientôt dû',
    message: 'Votre rappel de vaccination contre la fièvre jaune est attendu le 25/09.',
    date: '2026-09-25',
    icon: Syringe,
    color: 'text-amber-500',
    bg: 'bg-amber-100',
  },
  {
    id: 3,
    type: 'grossesse',
    title: 'Consultation prénatale',
    message: 'Consultation mensuelle recommandée cette semaine (32e semaine).',
    date: '2026-09-15',
    icon: Baby,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 4,
    type: 'sante',
    title: 'Bilan annuel',
    message: 'Il est temps de planifier votre bilan de santé annuel.',
    date: '2026-09-20',
    icon: Stethoscope,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
]

export default function AlertesPage() {
  return (
    <>
      <AppHeader
        title="Alertes"
        subtitle="Vos rappels et notifications santé"
        backHref="/dashboard"
      />

      <div className="space-y-3">
        {ALERTS.map((a) => {
          const Icon = a.icon
          const date = new Date(a.date)
          const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${a.bg} ${a.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <Badge
                      variant={daysLeft < 3 ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {daysLeft <= 0
                        ? "Aujourd'hui"
                        : daysLeft === 1
                        ? 'Demain'
                        : `Dans ${daysLeft} jours`}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {date.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Activez les notifications dans les{' '}
            <a href="/parametres" className="text-primary hover:underline">
              paramètres
            </a>{' '}
            pour ne plus rien rater.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
