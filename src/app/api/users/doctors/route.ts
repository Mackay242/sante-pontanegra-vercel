import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/users/doctors — list all medical staff (DOCTOR + NURSE)
export async function GET() {
  const doctors = await db.user.findMany({
    where: {
      role: { in: ['DOCTOR', 'NURSE'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      specialty: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  // Add follower count + post count for each doctor
  const doctorsWithStats = await Promise.all(
    doctors.map(async (d) => {
      const [followersCount, postsCount] = await Promise.all([
        db.follow.count({ where: { followingId: d.id } }),
        db.post.count({ where: { authorId: d.id } }),
      ])
      return { ...d, followersCount, postsCount }
    })
  )

  // Get current user's following list
  const me = await getCurrentUser()
  let followingIds: string[] = []
  if (me) {
    const following = await db.follow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    })
    followingIds = following.map((f) => f.followingId)
  }

  return NextResponse.json({
    doctors: doctorsWithStats,
    followingIds,
  })
}
