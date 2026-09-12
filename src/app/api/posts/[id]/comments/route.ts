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

    // Determine if this is a medical answer
    const isMedicalAnswer = ['DOCTOR', 'NURSE'].includes(user.role)

    const comment = await db.comment.create({
      data: {
        postId: id,
        authorId: user.id,
        authorName: user.name,
        content: parsed.data.content.trim(),
        isMedicalAnswer,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, specialty: true, avatarUrl: true },
        },
      },
    })

    // If it's a medical answer on a question, mark the post as solved
    if (isMedicalAnswer && post.postType === 'question' && !post.solved) {
      await db.post.update({
        where: { id },
        data: { solved: true },
      })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err) {
    console.error('[posts/comments] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de l\'ajout du commentaire.' },
      { status: 500 }
    )
  }
}

// PATCH /api/posts/[id]/comments — pin a comment (medical/admin only)
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE' },
        { status: 401 }
      )
    }

    if (!['DOCTOR', 'NURSE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Réservé au personnel médical.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    if (!commentId) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', message: 'commentId requis' },
        { status: 400 }
      )
    }

    const comment = await db.comment.findUnique({ where: { id: commentId } })
    if (!comment) {
      return NextResponse.json({ error: 'COMMENTAIRE_INTROUVABLE' }, { status: 404 })
    }

    const updated = await db.comment.update({
      where: { id: commentId },
      data: { pinned: !comment.pinned },
    })

    return NextResponse.json({ pinned: updated.pinned })
  } catch (err) {
    console.error('[posts/comments/pin] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
