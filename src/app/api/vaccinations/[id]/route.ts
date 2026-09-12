import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/vaccinations/[id]
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
    const vaccination = await db.vaccination.findUnique({ where: { id } })
    if (!vaccination || vaccination.userId !== user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Vaccination introuvable ou non autorisée.' },
        { status: 403 }
      )
    }

    await db.vaccination.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[vaccinations/delete] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
