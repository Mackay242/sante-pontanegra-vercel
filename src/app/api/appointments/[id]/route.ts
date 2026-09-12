import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH /api/appointments/[id] — update status
export async function PATCH(
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
    const status = body?.status
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'STATUT_INVALIDE' },
        { status: 400 }
      )
    }

    const appointment = await db.appointment.findUnique({ where: { id } })
    if (!appointment || appointment.userId !== user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Rendez-vous introuvable ou non autorisé.' },
        { status: 403 }
      )
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ appointment: updated })
  } catch (err) {
    console.error('[appointments/update] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id]
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
    const appointment = await db.appointment.findUnique({ where: { id } })
    if (!appointment || appointment.userId !== user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Rendez-vous introuvable ou non autorisé.' },
        { status: 403 }
      )
    }

    await db.appointment.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[appointments/delete] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
