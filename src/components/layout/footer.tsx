import Link from 'next/link'
import { Heart, Phone } from 'lucide-react'
import { APP_NAME, APP_TAGLINE } from '@/lib/data/app'
import { EMERGENCY_NUMBERS } from '@/lib/data/centres'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-3 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-gradient">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-bold">{APP_NAME}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Liens utiles</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <Link href="/dashboard" className="hover:text-primary">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/centres" className="hover:text-primary">
                Centres de santé
              </Link>
            </li>
            <li>
              <Link href="/videos" className="hover:text-primary">
                Vidéos santé
              </Link>
            </li>
            <li>
              <Link href="/parametres/legal" className="hover:text-primary">
                Mentions légales
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Urgences</h3>
          <ul className="space-y-2 text-sm">
            {EMERGENCY_NUMBERS.map((e) => (
              <li key={e.number} className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                <a
                  href={`tel:${e.number}`}
                  className="font-semibold text-destructive hover:underline"
                >
                  {e.number}
                </a>
                <span className="text-muted-foreground">— {e.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row md:px-6">
          <p>
            © {year} {APP_NAME}. Tous droits réservés.
          </p>
          <p>
            Pointe-Noire, République du Congo — Conçu pour la santé de tous.
          </p>
        </div>
      </div>
    </footer>
  )
}
