import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { vaccinationSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/vaccinations
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  const vaccinations = await db.vaccination.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ vaccinations })
}

// POST /api/vaccinations
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
    const parsed = vaccinationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { vaccine, date, nextDue, notes } = parsed.data
    const vaccination = await db.vaccination.create({
      data: {
        userId: user.id,
        vaccine: vaccine.trim(),
        date: new Date(date),
        nextDue: nextDue ? new Date(nextDue) : null,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json({ vaccination }, { status: 201 })
  } catch (err) {
    console.error('[vaccinations/create] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
