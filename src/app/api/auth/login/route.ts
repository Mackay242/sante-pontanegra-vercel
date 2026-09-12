import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { setSessionCookie, verifyPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'DONNEES_INVALIDES',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data
    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: 'IDENTIFIANTS_INVALIDES', message: 'Email ou mot de passe incorrect.' },
        { status: 401 }
      )
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'ADMIN',
    }

    await setSessionCookie(safeUser)

    return NextResponse.json({ user: safeUser })
  } catch (err) {
    console.error('[auth/login] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de la connexion.' },
      { status: 500 }
    )
  }
}
