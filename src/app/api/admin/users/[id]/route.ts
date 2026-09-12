import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ALL_ROLES, type Role } from '@/lib/roles'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/users/[id] — change user role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { role, specialty } = body

    if (role && !ALL_ROLES.includes(role as Role)) {
      return NextResponse.json(
        { error: 'ROLE_INVALID', message: `Rôle valide requis: ${ALL_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    // Prevent self-demotion
    if (id === admin.id && role && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'AUTO_INTERDIT', message: 'Vous ne pouvez pas vous rétrograder.' },
        { status: 400 }
      )
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(specialty !== undefined ? { specialty: specialty || null } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        specialty: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      const code = err.message === 'UNAUTHORIZED' ? 401 : 403
      return NextResponse.json(
        { error: err.message === 'UNAUTHORIZED' ? 'NON_AUTHENTIFIE' : 'INTERDIT' },
        { status: code }
      )
    }
    console.error('[admin/users/update] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
