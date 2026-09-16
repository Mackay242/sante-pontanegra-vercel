import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/consultations — list current user's consultations
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  // Get consultations where user is patient OR doctor
  const consultations = await db.consultation.findMany({
    where: {
      OR: [{ patientId: user.id }, { doctorId: user.id }],
      status: 'active',
    },
    include: {
      patient: {
        select: { id: true, name: true, role: true, specialty: true, avatarUrl: true },
      },
      doctor: {
        select: { id: true, name: true, role: true, specialty: true, avatarUrl: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // last message only
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ consultations })
}
