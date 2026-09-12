import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { profileUpdateSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/profile — current user's full profile
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        specialty: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'USER_INTROUVABLE' }, { status: 404 })
    }

    // Get stats
    const [postsCount, followersCount, followingCount, commentsCount, thanksReceived] =
      await Promise.all([
        db.post.count({ where: { authorId: user.id } }),
        db.follow.count({ where: { followingId: user.id } }),
        db.follow.count({ where: { followerId: user.id } }),
        db.comment.count({ where: { authorId: user.id } }),
        // Count "thanks" reactions received (on user's posts)
        db.reaction.count({
          where: {
            type: 'thanks',
            post: { authorId: user.id },
          },
        }),
      ])

    return NextResponse.json({
      profile,
      stats: {
        postsCount,
        followersCount,
        followingCount,
        commentsCount,
        thanksReceived,
      },
    })
  } catch (err) {
    console.error('[profile/get] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}

// PUT /api/profile — update profile
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, phone, bio, specialty, avatarUrl } = parsed.data

    // Only DOCTOR/NURSE/ADMIN can update specialty
    const canUpdateSpecialty = ['DOCTOR', 'NURSE', 'ADMIN'].includes(user.role)

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() || undefined,
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl || null,
        specialty: canUpdateSpecialty ? (specialty?.trim() || null) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        specialty: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ profile: updated })
  } catch (err) {
    console.error('[profile/update] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
