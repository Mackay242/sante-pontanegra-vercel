import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/posts/[id]/pin — toggle pin (DOCTOR/NURSE/ADMIN only)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    if (!['DOCTOR', 'NURSE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Réservé au personnel médical.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const post = await db.post.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: 'POST_INTROUVABLE' }, { status: 404 })
    }

    const updated = await db.post.update({
      where: { id },
      data: { pinned: !post.pinned },
    })

    return NextResponse.json({ pinned: updated.pinned })
  } catch (err) {
    console.error('[posts/pin] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
