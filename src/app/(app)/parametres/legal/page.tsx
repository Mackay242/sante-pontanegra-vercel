import { AppHeader } from '@/components/layout/navbar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LegalPage() {
  return (
    <>
      <AppHeader
        title="Mentions légales"
        subtitle="Informations légales et politique de confidentialité"
        backHref="/parametres"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Éditeur de l&apos;application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Santé Pontanegra</strong> est une plateforme numérique
              de santé destinée aux habitants de Pointe-Noire, République du Congo.
            </p>
            <p>
              Contact : <a href="mailto:contact@santepontanegra.cg" className="text-primary hover:underline">contact@santepontanegra.cg</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Santé Pontanegra s&apos;engage à protéger vos données personnelles.
              Vos informations sont chiffrées, ne sont jamais partagées avec des
              tiers à des fins commerciales, et ne quittent jamais la plateforme.
            </p>
            <p>
              Conformément à la loi congolaise sur la protection des données et
              au RGPD, vous pouvez à tout moment demander l&apos;accès, la
              rectification ou la suppression de vos données.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à l&apos;adresse email ci-dessus.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avertissement médical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Les informations fournies par Santé Pontanegra, y compris par
              l&apos;assistant médical IA, ne constituent pas un avis médical
              personnalisé et ne remplacent en aucun cas une consultation
              avec un professionnel de santé qualifié.
            </p>
            <p>
              En cas d&apos;urgence vitale, contactez immédiatement le{' '}
              <strong>118</strong> (SAMU/Pompiers) ou le <strong>117</strong>{' '}
              (Police Secours).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Santé Pontanegra utilise un cookie de session strictement nécessaire
              au fonctionnement du service (maintien de la connexion).
              Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
