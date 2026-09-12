import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { amaQuestionSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/ama/[id]/questions — list questions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const questions = await db.aMAQuestion.findMany({
    where: { amaId: id },
    orderBy: [{ votes: 'desc' }, { createdAt: 'asc' }],
    include: {
      author: {
        select: { id: true, name: true, role: true, avatarUrl: true },
      },
    },
  })

  return NextResponse.json({ questions })
}

// POST /api/ama/[id]/questions — ask a question (and vote up)
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
    const ama = await db.aMA.findUnique({ where: { id } })
    if (!ama) {
      return NextResponse.json({ error: 'AMA_INTROUVABLE' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = amaQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const question = await db.aMAQuestion.create({
      data: {
        amaId: id,
        authorId: user.id,
        content: parsed.data.content.trim(),
        votes: 1, // auto-vote for the asker
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json({ question }, { status: 201 })
  } catch (err) {
    console.error('[ama/questions] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}

// PATCH /api/ama/[id]/questions — vote up a question
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'NON_AUTHENTIFIE' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    if (!questionId) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', message: 'questionId requis' },
        { status: 400 }
      )
    }

    const question = await db.aMAQuestion.findUnique({
      where: { id: questionId },
    })
    if (!question) {
      return NextResponse.json({ error: 'QUESTION_INTROUVABLE' }, { status: 404 })
    }

    const updated = await db.aMAQuestion.update({
      where: { id: questionId },
      data: { votes: question.votes + 1 },
    })

    return NextResponse.json({ votes: updated.votes })
  } catch (err) {
    console.error('[ama/questions/vote] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
