import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { postSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/posts — list community posts (publicly readable)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? null
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)
  const cursor = searchParams.get('cursor')

  const posts = await db.post.findMany({
    where: category && category !== 'tous' ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      comments: {
        orderBy: { createdAt: 'asc' },
        take: 50,
      },
    },
  })

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      likedBy: JSON.parse(p.likedBy),
    })),
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
  })
}

// POST /api/posts — create a new post (auth required)
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
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'DONNEES_INVALIDES',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { title, content, category } = parsed.data
    const post = await db.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        authorName: user.name,
        authorId: user.id,
      },
    })

    return NextResponse.json({ post: { ...post, likedBy: [] } }, { status: 201 })
  } catch (err) {
    console.error('[posts/create] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de la création du post.' },
      { status: 500 }
    )
  }
}
