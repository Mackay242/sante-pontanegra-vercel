import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/posts/[id]/like — toggle like
export async function POST(
  request: Request,
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

    const { id } = await params
    const post = await db.post.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: 'POST_INTROUVABLE' }, { status: 404 })
    }

    const likedBy: string[] = JSON.parse(post.likedBy)
    const alreadyLiked = likedBy.includes(user.id)

    const updated = await db.post.update({
      where: { id },
      data: {
        likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
        likedBy: JSON.stringify(
          alreadyLiked
            ? likedBy.filter((uid) => uid !== user.id)
            : [...likedBy, user.id]
        ),
      },
    })

    return NextResponse.json({
      liked: !alreadyLiked,
      likes: updated.likes,
    })
  } catch (err) {
    console.error('[posts/like] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors du like.' },
      { status: 500 }
    )
  }
}
