import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { commentSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// POST /api/posts/[id]/comments — add a comment
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
    const body = await request.json()
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const post = await db.post.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: 'POST_INTROUVABLE' }, { status: 404 })
    }

    const comment = await db.comment.create({
      data: {
        postId: id,
        authorId: user.id,
        authorName: user.name,
        content: parsed.data.content.trim(),
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    console.error('[posts/comments] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de l\'ajout du commentaire.' },
      { status: 500 }
    )
  }
}
