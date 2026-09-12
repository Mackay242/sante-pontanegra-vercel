import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { postSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// GET /api/posts — list posts (filterable)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? null
  const postType = searchParams.get('postType') ?? null
  const medicalOnly = searchParams.get('medicalOnly') === 'true'
  const pinnedOnly = searchParams.get('pinnedOnly') === 'true'
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)

  const where: Record<string, unknown> = {}
  if (category && category !== 'tous') where.category = category
  if (postType && postType !== 'all') where.postType = postType
  if (pinnedOnly) where.pinned = true
  if (medicalOnly) {
    where.author = {
      role: { in: ['DOCTOR', 'NURSE'] },
    }
  }

  const posts = await db.post.findMany({
    where,
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: {
      comments: {
        orderBy: [{ pinned: 'desc' }, { createdAt: 'asc' }],
        take: 50,
        include: {
          author: {
            select: { id: true, name: true, role: true, specialty: true, avatarUrl: true },
          },
        },
      },
      reactions: true,
      author: {
        select: { id: true, name: true, role: true, specialty: true, avatarUrl: true },
      },
    },
  })

  // Aggregate reactions count by type
  const postsWithReactions = posts.map((p) => {
    const reactionCounts: Record<string, number> = {
      like: 0,
      thanks: 0,
      useful: 0,
      support: 0,
      share: 0,
    }
    const userReactions: Record<string, boolean> = {}
    p.reactions.forEach((r) => {
      reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1
    })

    return {
      ...p,
      likedBy: JSON.parse(p.likedBy),
      reactionCounts,
      reactions: undefined, // remove raw array
    }
  })

  return NextResponse.json({ posts: postsWithReactions })
}

// POST /api/posts — create a new post
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

    const { title, content, category, postType, mediaUrl, mediaType } = parsed.data

    // Only DOCTOR/NURSE/ADMIN can post alerts
    const finalPostType =
      postType === 'alert' &&
      !['DOCTOR', 'NURSE', 'ADMIN'].includes(user.role)
        ? 'post'
        : postType

    const post = await db.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        postType: finalPostType,
        authorName: user.name,
        authorId: user.id,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
    })

    return NextResponse.json(
      { post: { ...post, likedBy: [], reactionCounts: {} } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[posts/create] error:', err)
    return NextResponse.json(
      { error: 'ERREUR_INTERNE', message: 'Erreur lors de la création du post.' },
      { status: 500 }
    )
  }
}
