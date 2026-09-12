import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { amaSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/ama — list AMA sessions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'all' // all | upcoming | live | finished

  const where: Record<string, unknown> = {}
  if (status === 'upcoming') {
    where.startsAt = { gt: new Date() }
    where.isLive = false
    where.isFinished = false
  } else if (status === 'live') {
    where.isLive = true
  } else if (status === 'finished') {
    where.isFinished = true
  }

  const sessions = await db.aMA.findMany({
    where,
    orderBy: { startsAt: 'desc' },
    take: 50,
    include: {
      host: {
        select: {
          id: true,
          name: true,
          role: true,
          specialty: true,
          avatarUrl: true,
        },
      },
      _count: { select: { questions: true } },
    },
  })

  return NextResponse.json({ sessions })
}

// POST /api/ama — create an AMA session (DOCTOR/NURSE/ADMIN only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    if (!['DOCTOR', 'NURSE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Réservé au personnel médical.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = amaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { title, description, startsAt, endsAt } = parsed.data
    const start = new Date(startsAt)
    const end = new Date(endsAt)

    if (end <= start) {
      return NextResponse.json(
        { error: 'DATES_INVALIDES', message: 'La fin doit être après le début.' },
        { status: 400 }
      )
    }

    const ama = await db.aMA.create({
      data: {
        hostId: user.id,
        title: title.trim(),
        description: description.trim(),
        startsAt: start,
        endsAt: end,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            role: true,
            specialty: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json({ ama }, { status: 201 })
  } catch (err) {
    console.error('[ama/create] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
