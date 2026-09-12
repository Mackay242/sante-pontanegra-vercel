/**
 * Sensibilisation videos (public CC0 sources).
 */

export type VideoCategory = {
  id: string
  label: string
  icon: string
}

export type Video = {
  id: string
  titre: string
  description: string
  url: string
  duration: string
  category: string
  thumbnail?: string
}

export const VIDEO_CATEGORIES: VideoCategory[] = [
  { id: 'tous', label: 'Toutes', icon: '🎬' },
  { id: 'sante', label: 'Santé', icon: '❤️' },
  { id: 'hygiene', label: 'Hygiène', icon: '🧼' },
  { id: 'maladies', label: 'Maladies', icon: '🦠' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'enfants', label: 'Enfants', icon: '👶' },
]

export const VIDEOS: Video[] = [
  {
    id: '1',
    titre: 'Prévenir l\'hypertension artérielle',
    description:
      'Les gestes simples pour maintenir une tension artérielle normale au quotidien. Apprenez à mesurer votre tension et à adopter les bons réflexes.',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '5:32',
    category: 'sante',
  },
  {
    id: '2',
    titre: 'Bien se laver les mains',
    description:
      'La technique complète de lavage des mains en 7 étapes pour éliminer 99 % des microbes.',
    url: 'https://www.w3schools.com/html/movie.mp4',
    duration: '2:48',
    category: 'hygiene',
  },
  {
    id: '3',
    titre: 'Alimentation équilibrée',
    description:
      'Construire une assiette équilibrée avec les produits locaux du Congo.',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '4:15',
    category: 'nutrition',
  },
  {
    id: '4',
    titre: 'Vaccination de l\'enfant',
    description:
      'Le calendrier vaccinal de 0 à 5 ans, point par point.',
    url: 'https://www.w3schools.com/html/movie.mp4',
    duration: '6:20',
    category: 'enfants',
  },
  {
    id: '5',
    titre: 'Reconnaître le paludisme',
    description:
      'Symptômes, prévention et traitement du paludisme en zone tropicale.',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '7:05',
    category: 'maladies',
  },
  {
    id: '6',
    titre: 'Hygiène de l\'eau',
    description:
      'Comment rendre l\'eau potable à la maison : ébullition, filtration, chloration.',
    url: 'https://www.w3schools.com/html/movie.mp4',
    duration: '3:40',
    category: 'hygiene',
  },
  {
    id: '7',
    titre: 'Prévention du diabète',
    description:
      'Comprendre le diabète de type 2 et adopter un mode de vie préventif.',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '5:50',
    category: 'sante',
  },
  {
    id: '8',
    titre: 'Soins du nourrisson',
    description:
      'Les premiers soins à apporter à un nouveau-né à la maison.',
    url: 'https://www.w3schools.com/html/movie.mp4',
    duration: '8:12',
    category: 'enfants',
  },
]
