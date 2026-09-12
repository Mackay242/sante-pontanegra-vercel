import { Pill, Info } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const MEDICAMENTS = [
  {
    nom: 'Paracétamol 500mg',
    usage: 'Fièvre, douleurs légères',
    posologie: 'Adulte : 1 à 2 comprimés, 3 fois par jour max',
    precautions: 'Ne pas dépasser 4g/jour. Contre-indiqué en cas d\'insuffisance hépatique.',
  },
  {
    nom: 'Ibuprofène 400mg',
    usage: 'Douleurs, inflammations',
    posologie: 'Adulte : 1 comprimé, 3 fois par jour max',
    precautions: 'À prendre pendant les repas. Éviter en cas d\'ulcère ou de grossesse.',
  },
  {
    nom: 'Amoxicilline 500mg',
    usage: 'Infections bactériennes (sur prescription)',
    posologie: 'Selon prescription médicale',
    precautions: 'Antibiotique. À prendre jusqu\'à la fin du traitement. Ne jamais automédiquer.',
  },
  {
    nom: 'Sérum de réhydratation orale (SRO)',
    usage: 'Déshydratation, diarrhée',
    posologie: '1 sachet dilué dans 1L d\'eau. Boire par petites gorgées.',
    precautions: 'Indispensable en cas de diarrhée chez l\'enfant.',
  },
  {
    nom: 'Moustiquaire imprégnée',
    usage: 'Prévention du paludisme',
    posologie: 'Usage nocturne systématique',
    precautions: 'Le moyen le plus efficace contre le paludisme au Congo.',
  },
  {
    nom: 'Artéméther + Luméfantrine',
    usage: 'Traitement du paludisme simple',
    posologie: 'Sur prescription médicale uniquement',
    precautions: 'À prendre avec un repas riche en graisses. Consultez un médecin avant.',
  },
]

export default function MedicamentsPage() {
  return (
    <>
      <AppHeader
        title="Médicaments"
        subtitle="Guide des médicaments essentiels"
        backHref="/dashboard"
      />

      <Card className="mb-6 border-primary/30 bg-medical-gradient-soft">
        <CardContent className="flex gap-3 py-4">
          <Info className="h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Ce guide est informatif. Ne jamais automédiquer sans avis médical,
            particulièrement pour les antibiotiques et antipaludéens.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {MEDICAMENTS.map((m) => (
          <Card key={m.nom}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                {m.nom}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Usage</p>
                <p className="text-sm font-medium">{m.usage}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Posologie</p>
                <p className="text-sm">{m.posologie}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
                <p className="text-xs text-muted-foreground">Précautions</p>
                <p className="text-sm">{m.precautions}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
