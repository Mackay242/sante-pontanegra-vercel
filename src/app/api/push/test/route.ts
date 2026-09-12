import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { sendPushToUser, isPushConfigured } from '@/lib/push'

export const dynamic = 'force-dynamic'

// POST /api/push/test — send a test push notification to the current user
export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    if (!isPushConfigured()) {
      return NextResponse.json(
        {
          error: 'PUSH_NON_CONFIGURE',
          message:
            'VAPID keys non configurées. Générez-les avec `npx web-push generate-vapid-keys`.',
        },
        { status: 503 }
      )
    }

    await sendPushToUser(user.id, {
      title: '🧪 Test — Santé Pontanegra',
      body: 'Bonjour ! Les notifications push fonctionnent correctement.',
      url: '/dashboard',
      tag: 'test',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push/test] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Envoi impossible.' },
      { status: 500 }
    )
  }
}
