import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/users/[id]/follow — toggle follow
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

    const { id: targetId } = await params

    if (targetId === user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Vous ne pouvez pas vous suivre vous-même.' },
        { status: 400 }
      )
    }

    const target = await db.user.findUnique({ where: { id: targetId } })
    if (!target) {
      return NextResponse.json({ error: 'USER_INTROUVABLE' }, { status: 404 })
    }

    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetId,
        },
      },
    })

    if (existing) {
      await db.follow.delete({ where: { id: existing.id } })
      return NextResponse.json({ following: false })
    } else {
      await db.follow.create({
        data: { followerId: user.id, followingId: targetId },
      })
      return NextResponse.json({ following: true })
    }
  } catch (err) {
    console.error('[users/follow] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}

// GET /api/users/[id]/follow — check if current user follows target
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ following: false })
    }

    const { id: targetId } = await params
    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetId,
        },
      },
    })

    const followersCount = await db.follow.count({
      where: { followingId: targetId },
    })

    return NextResponse.json({ following: !!existing, followersCount })
  } catch {
    return NextResponse.json({ following: false, followersCount: 0 })
  }
}
