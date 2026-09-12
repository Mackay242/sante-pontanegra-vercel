import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { chatSchema } from '@/lib/validators'
import { getMedicalReply } from '@/lib/llm'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
// Allow up to 30s for LLM responses
export const maxDuration = 30

// POST /api/chat — send a message and get a bot reply
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'DONNEES_INVALIDES', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Save user message
    const userMsg = await db.chatMessage.create({
      data: {
        userId: user.id,
        role: 'user',
        content: parsed.data.message,
      },
    })

    // Load conversation history (last 10 messages) for context
    const history = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    // Generate bot reply (LLM if enabled, rule-based otherwise)
    const botContent = await getMedicalReply(parsed.data.message, history)

    const botMsg = await db.chatMessage.create({
      data: {
        userId: user.id,
        role: 'bot',
        content: botContent,
      },
    })

    return NextResponse.json({
      userMessage: userMsg,
      botMessage: botMsg,
    })
  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors du traitement du message.' },
      { status: 500 }
    )
  }
}

// GET /api/chat — load conversation history
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'NON_AUTHENTIFIE', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  const messages = await db.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  return NextResponse.json({ messages })
}
