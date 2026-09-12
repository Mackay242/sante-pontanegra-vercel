import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/ama/[id] — get AMA details + questions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ama = await db.aMA.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            role: true,
            specialty: true,
            avatarUrl: true,
            bio: true,
          },
        },
        questions: {
          orderBy: [{ votes: 'desc' }, { createdAt: 'asc' }],
          include: {
            author: {
              select: { id: true, name: true, role: true, avatarUrl: true },
            },
          },
        },
      },
    })

    if (!ama) {
      return NextResponse.json({ error: 'AMA_INTROUVABLE' }, { status: 404 })
    }

    return NextResponse.json({ ama })
  } catch (err) {
    console.error('[ama/get] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}

// PATCH /api/ama/[id] — start/stop live mode (host only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'NON_AUTHENTIFIE' }, { status: 401 })
    }

    if (!['DOCTOR', 'NURSE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Réservé au personnel médical.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const ama = await db.aMA.findUnique({ where: { id } })
    if (!ama) {
      return NextResponse.json({ error: 'AMA_INTROUVABLE' }, { status: 404 })
    }

    if (ama.hostId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Vous n\'êtes pas l\'hôte.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const action = body?.action

    let data: Record<string, unknown> = {}
    if (action === 'start') {
      data = { isLive: true, isFinished: false }
    } else if (action === 'stop') {
      data = { isLive: false, isFinished: true }
    } else {
      return NextResponse.json(
        { error: 'ACTION_INVALIDE', message: 'action requis: start ou stop' },
        { status: 400 }
      )
    }

    const updated = await db.aMA.update({ where: { id }, data })
    return NextResponse.json({ ama: updated })
  } catch (err) {
    console.error('[ama/patch] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
