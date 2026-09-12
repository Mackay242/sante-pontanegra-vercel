import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: [
          '/dashboard',
          '/profil',
          '/parametres',
          '/medecin',
          '/communaute',
          '/rendezvous',
          '/dossier',
          '/vaccination',
          '/grossesse',
          '/centres',
          '/videos',
          '/pharmacie',
          '/symptomes',
          '/medicaments',
          '/alertes',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
