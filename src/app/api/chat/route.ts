import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { chatSchema } from '@/lib/validators'
import { getMedicalReply } from '@/lib/llm'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// POST /api/chat — send a message (with optional media) and get a bot reply
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

    const { message, mediaUrl, mediaType } = parsed.data

    // Save user message (with optional media)
    const userMsg = await db.chatMessage.create({
      data: {
        userId: user.id,
        role: 'user',
        content: message,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
    })

    // Load conversation history (last 10 messages) for context
    const history = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    // Generate bot reply (LLM if enabled, rule-based otherwise)
    // If user sent an image, the bot acknowledges it
    let userMessageForBot = message
    if (mediaType === 'image' && mediaUrl) {
      userMessageForBot = `[L'utilisateur a envoyé une photo] ${message}`
    } else if (mediaType === 'audio') {
      userMessageForBot = `[L'utilisateur a envoyé un message vocal] ${message || '(message audio)'}`
    }
    const botContent = await getMedicalReply(userMessageForBot, history)

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

// GET /api/chat — load conversation history (with media)
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
