import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { chatSchema } from '@/lib/validators'
import { getBotReply } from '@/lib/data/bot'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

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

    // Generate bot reply (rule-based; can be replaced by LLM API server-side)
    const botContent = getBotReply(parsed.data.message)
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
