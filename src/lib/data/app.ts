/**
 * App navigation and services configuration.
 */

export type TabItem = {
  key: string
  label: string
  icon: string
  href: string
}

export const TAB_ITEMS: TabItem[] = [
  { key: 'accueil', label: 'Accueil', icon: 'home', href: '/dashboard' },
  { key: 'communaute', label: 'Communauté', icon: 'users', href: '/communaute' },
  { key: 'medecin', label: 'Médecin', icon: 'message-circle', href: '/medecin' },
  { key: 'centres', label: 'Centres', icon: 'map-pin', href: '/centres' },
  { key: 'profil', label: 'Profil', icon: 'user', href: '/profil' },
]

export type Service = {
  key: string
  icon: string
  title: string
  sub: string
  href: string | null
  soon?: boolean
  color: 'primary' | 'secondary' | 'accent' | 'muted'
}

export const SERVICES: Service[] = [
  {
    key: 'videos',
    icon: 'video',
    title: 'Sensibilisation',
    sub: 'Vidéos courtes, validées',
    href: '/videos',
    color: 'primary',
  },
  {
    key: 'medecin',
    icon: 'message-circle',
    title: 'Parler à un Médecin',
    sub: 'Anonyme · gratuit',
    href: '/medecin',
    color: 'primary',
  },
  {
    key: 'centres',
    icon: 'map-pin',
    title: 'Trouver un Centre',
    sub: 'Hôpitaux, cliniques, CSI',
    href: '/centres',
    color: 'secondary',
  },
  {
    key: 'dossier',
    icon: 'file-text',
    title: 'Dossier Médical',
    sub: 'Suivez votre santé',
    href: '/dossier',
    color: 'accent',
  },
  {
    key: 'rendezvous',
    icon: 'calendar',
    title: 'Rendez-vous',
    sub: 'Prise de RDV simplifiée',
    href: '/rendezvous',
    color: 'secondary',
  },
  {
    key: 'vaccination',
    icon: 'syringe',
    title: 'Vaccination',
    sub: 'Calendrier et rappels',
    href: '/vaccination',
    color: 'accent',
  },
  {
    key: 'pharmacie',
    icon: 'pill',
    title: 'E-Pharmacie',
    sub: 'Bientôt disponible',
    href: '/pharmacie',
    color: 'muted',
    soon: true,
  },
  {
    key: 'grossesse',
    icon: 'baby',
    title: 'Grossesse',
    sub: 'Suivi semaine par semaine',
    href: '/grossesse',
    color: 'primary',
  },
]

export const PROMO_ITEM = {
  name: 'Paracétamol 500mg',
  oldPrice: '800 FCFA',
  newPrice: '500 FCFA',
  where: 'Pharmacie Sainte-Marie',
}

export const PARTNER = {
  name: 'Pharmacie Centrale Pointe-Noire',
  tagline: 'Vos médicaments authentiques, livrés en 2h',
}

export const APP_NAME = 'Santé Pontanegra'
export const APP_TAGLINE = 'Votre santé, notre priorité — Pointe-Noire'
export const APP_DESCRIPTION =
  "Plateforme de santé numérique pour les habitants de Pointe-Noire, Congo. Trouvez un centre de soin, parlez à un médecin, suivez votre dossier médical, et accédez à des vidéos de sensibilisation."
