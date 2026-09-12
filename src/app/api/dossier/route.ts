import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { dossierSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/dossier — get current user's medical dossier
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  let dossier = await db.medicalDossier.findUnique({
    where: { userId: user.id },
  })

  if (!dossier) {
    dossier = await db.medicalDossier.create({
      data: { userId: user.id },
    })
  }

  return NextResponse.json({
    dossier: {
      ...dossier,
      allergies: JSON.parse(dossier.allergies),
      maladiesChroniques: JSON.parse(dossier.maladiesChroniques),
      antecedents: JSON.parse(dossier.antecedents),
      medicamentsActuels: JSON.parse(dossier.medicamentsActuels),
    },
  })
}

// PUT /api/dossier — update dossier
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = dossierSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { groupeSanguin, allergies, maladiesChroniques, antecedents, medicamentsActuels } = parsed.data

    const dossier = await db.medicalDossier.upsert({
      where: { userId: user.id },
      update: {
        groupeSanguin: groupeSanguin || null,
        allergies: JSON.stringify(allergies),
        maladiesChroniques: JSON.stringify(maladiesChroniques),
        antecedents: JSON.stringify(antecedents),
        medicamentsActuels: JSON.stringify(medicamentsActuels),
      },
      create: {
        userId: user.id,
        groupeSanguin: groupeSanguin || null,
        allergies: JSON.stringify(allergies),
        maladiesChroniques: JSON.stringify(maladiesChroniques),
        antecedents: JSON.stringify(antecedents),
        medicamentsActuels: JSON.stringify(medicamentsActuels),
      },
    })

    return NextResponse.json({
      dossier: {
        ...dossier,
        allergies: JSON.parse(dossier.allergies),
        maladiesChroniques: JSON.parse(dossier.maladiesChroniques),
        antecedents: JSON.parse(dossier.antecedents),
        medicamentsActuels: JSON.parse(dossier.medicamentsActuels),
      },
    })
  } catch (err) {
    console.error('[dossier/update] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE' },
      { status: 500 }
    )
  }
}
