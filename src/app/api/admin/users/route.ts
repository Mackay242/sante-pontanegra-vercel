import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/users — list all users (admin only)
export async function GET() {
  try {
    await requireAdmin()

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        specialty: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Accès réservé aux administrateurs.' },
        { status: 403 }
      )
    }
    console.error('[admin/users] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
