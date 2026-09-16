import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/consultations/doctor/[doctorId] — get or create consultation with doctor
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    const { doctorId } = await params

    // Verify target is a doctor
    const doctor = await db.user.findUnique({ where: { id: doctorId } })
    if (!doctor || !['DOCTOR', 'NURSE'].includes(doctor.role)) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Cet utilisateur n\'est pas un médecin.' },
        { status: 400 }
      )
    }

    if (doctorId === user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Vous ne pouvez pas consulter vous-même.' },
        { status: 400 }
      )
    }

    // Get or create consultation
    const existing = await db.consultation.findUnique({
      where: {
        patientId_doctorId: { patientId: user.id, doctorId },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ consultation: existing })
    }

    // Create new consultation
    const consultation = await db.consultation.create({
      data: {
        patientId: user.id,
        doctorId,
        status: 'active',
      },
      include: {
        messages: true,
      },
    })

    return NextResponse.json({ consultation }, { status: 201 })
  } catch (err) {
    console.error('[consultations/doctor] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
