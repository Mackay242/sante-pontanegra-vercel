import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { amaAnswerSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// PATCH /api/ama/[id]/questions/[questionId]/answer — host answers a question
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
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

    const { id, questionId } = await params

    const ama = await db.aMA.findUnique({ where: { id } })
    if (!ama) {
      return NextResponse.json({ error: 'AMA_INTROUVABLE' }, { status: 404 })
    }

    if (ama.hostId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Seul l\'hôte peut répondre.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = amaAnswerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await db.aMAQuestion.update({
      where: { id: questionId },
      data: {
        answered: true,
        answer: parsed.data.answer,
      },
    })

    return NextResponse.json({ question: updated })
  } catch (err) {
    console.error('[ama/answer] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
