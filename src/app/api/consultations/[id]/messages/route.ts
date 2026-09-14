import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { consultationMessageSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/consultations/[id]/messages — list messages
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'NON_AUTHENTIFIE' }, { status: 401 })
    }

    const { id } = await params

    // Verify user is part of this consultation
    const consultation = await db.consultation.findUnique({ where: { id } })
    if (!consultation) {
      return NextResponse.json({ error: 'CONSULTATION_INTROUVABLE' }, { status: 404 })
    }
    if (consultation.patientId !== user.id && consultation.doctorId !== user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Accès refusé.' },
        { status: 403 }
      )
    }

    const messages = await db.consultationMessage.findMany({
      where: { consultationId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    // If user is doctor, mark messages from patient as read
    if (consultation.doctorId === user.id) {
      await db.consultationMessage.updateMany({
        where: {
          consultationId: id,
          isFromDoctor: false,
          readAt: null,
        },
        data: { readAt: new Date() },
      })
    } else {
      // Patient reads doctor's messages
      await db.consultationMessage.updateMany({
        where: {
          consultationId: id,
          isFromDoctor: true,
          readAt: null,
        },
        data: { readAt: new Date() },
      })
    }

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('[consultations/messages/get] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}

// POST /api/consultations/[id]/messages — send a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'NON_AUTHENTIFIE' }, { status: 401 })
    }

    const { id } = await params
    const consultation = await db.consultation.findUnique({ where: { id } })
    if (!consultation) {
      return NextResponse.json({ error: 'CONSULTATION_INTROUVABLE' }, { status: 404 })
    }
    if (consultation.patientId !== user.id && consultation.doctorId !== user.id) {
      return NextResponse.json(
        { error: 'INTERDIT', message: 'Accès refusé.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = consultationMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { content, mediaUrl, mediaType } = parsed.data
    const isFromDoctor = consultation.doctorId === user.id

    const message = await db.consultationMessage.create({
      data: {
        consultationId: id,
        senderId: user.id,
        content: content?.trim() || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        isFromDoctor,
      },
    })

    // Update consultation's updatedAt
    await db.consultation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[consultations/messages/post] error:', err)
    return NextResponse.json({ error: 'ERREUR_INTERNE' }, { status: 500 })
  }
}
