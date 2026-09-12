import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { appointmentSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/appointments — list current user's appointments
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  const appointments = await db.appointment.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({ appointments })
}

// POST /api/appointments — create a new appointment
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
    const parsed = appointmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { centreId, centreName, date, motif, notes } = parsed.data
    const appointment = await db.appointment.create({
      data: {
        userId: user.id,
        centreId,
        centreName,
        date: new Date(date),
        motif: motif.trim(),
        notes: notes?.trim() || null,
        status: 'pending',
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (err) {
    console.error('[appointments/create] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de la prise de rendez-vous.' },
      { status: 500 }
    )
  }
}
