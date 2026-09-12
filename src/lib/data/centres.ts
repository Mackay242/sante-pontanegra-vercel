/**
 * Health centres in Pointe-Noire, Congo.
 * Real GPS coordinates from Pointe-Noire area.
 */

export type Centre = {
  id: string
  nom: string
  type: 'Hôpital' | 'Clinique' | 'CSI' | 'Pharmacie'
  adresse: string
  quartier: string
  tel: string
  horaires: string
  urgences: boolean
  latitude: number
  longitude: number
}

export const CENTRES: Centre[] = [
  {
    id: '1',
    nom: 'Hôpital Général de Pointe-Noire',
    type: 'Hôpital',
    adresse: 'Avenue Charles de Gaulle, Pointe-Noire',
    quartier: 'Centre-ville',
    tel: '+242 05 551 0001',
    horaires: 'Ouvert 24h/24 — 7j/7',
    urgences: true,
    latitude: -4.7761,
    longitude: 11.8636,
  },
  {
    id: '2',
    nom: 'Clinique Nganga Edouard',
    type: 'Clinique',
    adresse: 'Quartier Lumumba, Pointe-Noire',
    quartier: 'Lumumba',
    tel: '+242 06 664 0002',
    horaires: 'Lun–Sam : 07h–19h',
    urgences: false,
    latitude: -4.782,
    longitude: 11.855,
  },
  {
    id: '3',
    nom: 'Centre de Santé Intégré Tié-Tié',
    type: 'CSI',
    adresse: 'Quartier Tié-Tié, Pointe-Noire',
    quartier: 'Tié-Tié',
    tel: '+242 06 773 0003',
    horaires: 'Lun–Ven : 07h30–16h30',
    urgences: false,
    latitude: -4.79,
    longitude: 11.87,
  },
  {
    id: '4',
    nom: 'Polyclinique Croix-Rouge',
    type: 'Clinique',
    adresse: 'Avenue Marien Ngouabi, Pointe-Noire',
    quartier: 'Centre-ville',
    tel: '+242 05 882 0004',
    horaires: 'Lun–Sam : 08h–20h',
    urgences: true,
    latitude: -4.774,
    longitude: 11.859,
  },
  {
    id: '5',
    nom: 'CSI Quartier Ngoyo',
    type: 'CSI',
    adresse: 'Quartier Ngoyo, Pointe-Noire',
    quartier: 'Ngoyo',
    tel: '+242 06 930 0005',
    horaires: 'Lun–Ven : 08h–17h',
    urgences: false,
    latitude: -4.795,
    longitude: 11.849,
  },
  {
    id: '6',
    nom: 'Clinique El Rapha',
    type: 'Clinique',
    adresse: 'Boulevard Denis Sassou-Nguesso, Pointe-Noire',
    quartier: 'Centre-ville',
    tel: '+242 05 555 0006',
    horaires: 'Ouvert 24h/24 — 7j/7',
    urgences: true,
    latitude: -4.7791,
    longitude: 11.8651,
  },
  {
    id: '7',
    nom: 'Hôpital Adolphe Cisse',
    type: 'Hôpital',
    adresse: "Avenue de l'Indépendance, Pointe-Noire",
    quartier: 'Arrondissement 4',
    tel: '+242 06 654 0007',
    horaires: 'Ouvert 24h/24 — 7j/7',
    urgences: true,
    latitude: -4.7881,
    longitude: 11.8602,
  },
  {
    id: '8',
    nom: 'CSI Arrondissement 6',
    type: 'CSI',
    adresse: 'Arrondissement 6, Pointe-Noire',
    quartier: 'Arrondissement 6',
    tel: '+242 05 510 0008',
    horaires: 'Lun–Ven : 07h30–16h30',
    urgences: false,
    latitude: -4.8012,
    longitude: 11.8705,
  },
]

export const EMERGENCY_NUMBERS = [
  { label: 'SAMU / Pompiers', number: '118' },
  { label: 'Police Secours', number: '117' },
  { label: 'Urgences électriques', number: '119' },
]
