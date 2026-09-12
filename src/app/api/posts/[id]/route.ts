import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/posts/[id] — delete a post (owner or admin)
export async function DELETE(
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

    const { id } = await params
    const post = await db.post.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: 'POST_INTROUVABLE' }, { status: 404 })
    }

    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Action non autorisée.' },
        { status: 403 }
      )
    }

    await db.post.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[posts/delete] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de la suppression.' },
      { status: 500 }
    )
  }
}
