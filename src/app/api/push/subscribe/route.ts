import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { saveSubscription, isPushConfigured } from '@/lib/push'

export const dynamic = 'force-dynamic'

// POST /api/push/subscribe — register a push subscription
export async function POST(request: Request) {
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
          message: 'Les notifications push ne sont pas activées sur ce serveur.',
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', message: 'Subscription invalide.' },
        { status: 400 }
      )
    }

    await saveSubscription(user.id, { endpoint, keys })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push/subscribe] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}

// DELETE /api/push/subscribe — unsubscribe
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    if (!endpoint) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', message: 'endpoint requis.' },
        { status: 400 }
      )
    }

    const { removeSubscription } = await import('@/lib/push')
    await removeSubscription(user.id, endpoint)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push/unsubscribe] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}

// GET /api/push/subscribe — check if push is configured
export async function GET() {
  return NextResponse.json({
    configured: isPushConfigured(),
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null,
  })
}
