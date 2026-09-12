import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Santé Pontanegra API',
    version: '1.0.0',
    description: 'Plateforme de santé numérique pour Pointe-Noire, Congo.',
    endpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/posts',
      '/api/posts/[id]',
      '/api/posts/[id]/like',
      '/api/posts/[id]/comments',
      '/api/appointments',
      '/api/appointments/[id]',
      '/api/dossier',
      '/api/chat',
      '/api/vaccinations',
      '/api/vaccinations/[id]',
      '/api/pregnancies',
    ],
  })
}
