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

// ─── Publicités défilantes (carte "Offre du jour") ─────────
export type Ad = {
  id: string
  type: 'medicament' | 'pharmacie' | 'service' | 'promo'
  title: string
  description: string
  price?: string
  oldPrice?: string
  cta: string
  where?: string
  color: 'primary' | 'secondary' | 'accent' | 'warning'
  emoji: string
}

export const ADS: Ad[] = [
  {
    id: 'ad-1',
    type: 'medicament',
    title: 'Paracétamol 500mg',
    description: 'Antidouleur et antipyrétique — boîte de 20 comprimés',
    oldPrice: '800 FCFA',
    price: '500 FCFA',
    cta: 'Voir l\'offre',
    where: 'Pharmacie Sainte-Marie',
    color: 'primary',
    emoji: '💊',
  },
  {
    id: 'ad-2',
    type: 'promo',
    title: '-30% sur tous les tests',
    description: 'Tests paludisme, glycémie, hypertension jusqu\'à vendredi',
    price: 'Dès 1 000 FCFA',
    cta: 'Profiter',
    where: 'Clinique El Rapha',
    color: 'accent',
    emoji: '🩺',
  },
  {
    id: 'ad-3',
    type: 'pharmacie',
    title: 'Moustiquaires imprégnées',
    description: 'Protection anti-paludisme — livraison gratuite à Pointe-Noire',
    price: '2 500 FCFA',
    cta: 'Commander',
    where: 'Pharmacie Centrale',
    color: 'secondary',
    emoji: '🦟',
  },
  {
    id: 'ad-4',
    type: 'service',
    title: 'Consultation à domicile',
    description: 'Un médecin se déplace chez vous en moins de 2h',
    price: '15 000 FCFA',
    cta: 'Réserver',
    where: 'Service Médical PN',
    color: 'warning',
    emoji: '👨‍⚕️',
  },
  {
    id: 'ad-5',
    type: 'medicament',
    title: 'Vitamine C 1000mg',
    description: 'Boostez votre immunité — tube de 30 comprimés effervescents',
    oldPrice: '3 500 FCFA',
    price: '2 000 FCFA',
    cta: 'Voir l\'offre',
    where: 'Pharmacie du Tié-Tié',
    color: 'primary',
    emoji: '🍊',
  },
  {
    id: 'ad-6',
    type: 'promo',
    title: 'Bilan de santé complet',
    description: 'Glycémie + tension + groupe sanguin + analyse d\'urine',
    oldPrice: '25 000 FCFA',
    price: '18 000 FCFA',
    cta: 'Profiter',
    where: 'Polyclinique Croix-Rouge',
    color: 'accent',
    emoji: '🩸',
  },
]

// ─── Sponsors (carte "Notre partenaire") ────────────────────
export type Sponsor = {
  id: string
  name: string
  tagline: string
  description: string
  category: 'clinique' | 'pharmacie' | 'ong' | 'gouvernement' | 'assurance'
  website?: string
  phone?: string
  logo: string // emoji placeholder
  color: 'primary' | 'secondary' | 'accent' | 'warning'
}

export const SPONSORS: Sponsor[] = [
  {
    id: 'sp-1',
    name: 'Pharmacie Centrale Pointe-Noire',
    tagline: 'Vos médicaments authentiques, livrés en 2h',
    description: 'Partenaire officiel depuis 2024 — réseau de 8 pharmacies',
    category: 'pharmacie',
    phone: '+242 05 555 0101',
    logo: '💊',
    color: 'primary',
  },
  {
    id: 'sp-2',
    name: 'Clinique El Rapha',
    tagline: 'Soins de qualité, accès pour tous',
    description: 'Urgences 24h/24, maternité, pédiatrie, laboratoire d\'analyse',
    category: 'clinique',
    phone: '+242 05 555 0006',
    logo: '🏥',
    color: 'accent',
  },
  {
    id: 'sp-3',
    name: 'Croix-Rouge Congolaise',
    tagline: 'Humanité, impartialité, neutralité',
    description: 'Programmes de santé communautaire et urgences humanitaires',
    category: 'ong',
    website: 'https://www.redcross.cg',
    logo: '✚',
    color: 'accent',
  },
  {
    id: 'sp-4',
    name: 'Ministère de la Santé',
    tagline: 'Programme National Paludisme',
    description: 'Campagne gratuite de distribution de moustiquaires imprégnées',
    category: 'gouvernement',
    website: 'https://sante.gouv.cg',
    logo: '🇨🇬',
    color: 'primary',
  },
  {
    id: 'sp-5',
    name: 'OMS Congo',
    tagline: 'Santé pour tous',
    description: 'Vaccination gratuite pour les enfants de 0 à 5 ans',
    category: 'ong',
    website: 'https://www.who.int/countries/cog',
    logo: '🌍',
    color: 'secondary',
  },
  {
    id: 'sp-6',
    name: 'UNICEF Congo',
    tagline: 'Pour chaque enfant, la santé',
    description: 'Soutien aux centres de santé intégrés (CSI) de Pointe-Noire',
    category: 'ong',
    website: 'https://www.unicef.org/congo',
    logo: '👶',
    color: 'warning',
  },
]

// Rétro-compatibilité (au cas où d'autres fichiers les utilisent encore)
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
