import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { pregnancySchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/pregnancies
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  const pregnancies = await db.pregnancy.findMany({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({ pregnancies })
}

// POST /api/pregnancies
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = pregnancySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { startDate, expectedBirth, notes } = parsed.data
    const start = new Date(startDate)
    const now = new Date()
    const weeks = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    )

    const pregnancy = await db.pregnancy.create({
      data: {
        userId: user.id,
        startDate: start,
        expectedBirth: new Date(expectedBirth),
        weeks: Math.max(0, weeks),
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json({ pregnancy }, { status: 201 })
  } catch (err) {
    console.error('[pregnancies/create] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
