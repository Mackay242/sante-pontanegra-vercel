import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSessionCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'DONNEES_INVALIDES',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, phone, email, password } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'EMAIL_DEJA_UTILISE', message: 'Un compte existe déjà avec cet email.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: 'USER',
      },
      select: { id: true, email: true, name: true, role: true },
    })

    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'NURSE' | 'DOCTOR' | 'ADMIN',
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('[auth/register] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de l\'inscription.' },
      { status: 500 }
    )
  }
}
