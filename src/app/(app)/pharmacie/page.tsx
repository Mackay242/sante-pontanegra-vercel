import { Pill, Clock, MapPin, Phone } from 'lucide-react'
import { AppHeader } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PROMO_ITEM, PARTNER } from '@/lib/data/app'

const PHARMACIES = [
  {
    nom: 'Pharmacie Centrale Pointe-Noire',
    adresse: 'Avenue Charles de Gaulle',
    tel: '+242 05 555 0101',
    horaires: 'Lun–Dim : 08h–22h',
    garde: true,
  },
  {
    nom: 'Pharmacie Sainte-Marie',
    adresse: 'Quartier Lumumba',
    tel: '+242 06 664 0102',
    horaires: 'Lun–Sam : 08h–20h',
    garde: false,
  },
  {
    nom: 'Pharmacie du Tié-Tié',
    adresse: 'Quartier Tié-Tié',
    tel: '+242 06 773 0103',
    horaires: 'Lun–Sam : 08h–19h',
    garde: false,
  },
]

export default function PharmaciePage() {
  return (
    <>
      <AppHeader
        title="E-Pharmacie"
        subtitle="Bientôt disponible"
        backHref="/dashboard"
      />

      <Card className="mb-6 overflow-hidden border-primary/30">
        <div className="bg-medical-gradient p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bientôt disponible</h2>
              <p className="text-sm text-white/90">
                Commandez vos médicaments en ligne et faites-vous livrer.
              </p>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Notre service e-pharmacie sera lancé prochainement. En attendant,
            retrouvez ci-dessous les pharmacies de garde à Pointe-Noire.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Offre du jour</p>
              <p className="text-lg font-bold">{PROMO_ITEM.name}</p>
              <p className="text-sm">
                <span className="font-bold text-primary">{PROMO_ITEM.newPrice}</span>{' '}
                <span className="text-muted-foreground line-through">{PROMO_ITEM.oldPrice}</span>
              </p>
              <p className="text-xs text-muted-foreground">{PROMO_ITEM.where}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Pharmacies à Pointe-Noire</h2>
      <div className="space-y-3">
        {PHARMACIES.map((p) => (
          <Card key={p.nom}>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{p.nom}</h3>
                  {p.garde && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      De garde
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {p.adresse}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.horaires}
                  </div>
                </div>
              </div>
              <Button asChild size="sm">
                <a href={`tel:${p.tel.replace(/\s/g, '')}`}>
                  <Phone className="mr-1 h-4 w-4" />
                  Appeler
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-primary/30 bg-medical-gradient-soft">
        <CardContent className="flex gap-3 py-4">
          <div>
            <p className="text-sm font-medium">Notre partenaire</p>
            <p className="text-base font-bold">{PARTNER.name}</p>
            <p className="text-sm text-muted-foreground">{PARTNER.tagline}</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
