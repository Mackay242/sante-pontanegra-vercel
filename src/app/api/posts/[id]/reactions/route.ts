import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { reactionSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// POST /api/posts/[id]/reactions — toggle a reaction on a post
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
    const parsed = reactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { type } = parsed.data

    // Check if user already reacted with this type
    const existing = await db.reaction.findUnique({
      where: {
        postId_userId: { postId: id, userId: user.id },
      },
    })

    if (existing) {
      if (existing.type === type) {
        // Toggle off — remove reaction
        await db.reaction.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ reacted: false, type: null })
      } else {
        // Change reaction type
        await db.reaction.update({
          where: { id: existing.id },
          data: { type },
        })
        return NextResponse.json({ reacted: true, type })
      }
    } else {
      // Create new reaction
      await db.reaction.create({
        data: {
          postId: id,
          userId: user.id,
          type,
        },
      })
      return NextResponse.json({ reacted: true, type })
    }
  } catch (err) {
    console.error('[reactions] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
