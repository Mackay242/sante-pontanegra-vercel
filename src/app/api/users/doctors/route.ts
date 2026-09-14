import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/users/doctors — list all medical staff (DOCTOR + NURSE)
// Query params: ?specialty=Pédiatrie or ?role=DOCTOR
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const specialty = searchParams.get('specialty')
  const roleFilter = searchParams.get('role')

  const where: Record<string, unknown> = {
    role: roleFilter ? roleFilter : { in: ['DOCTOR', 'NURSE'] },
  }
  if (specialty && specialty !== 'all') {
    where.specialty = { contains: specialty, mode: 'insensitive' }
  }

  const doctors = await db.user.findMany({
    where,
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

  // Add follower count + post count + consultation count for each doctor
  const doctorsWithStats = await Promise.all(
    doctors.map(async (d) => {
      const [followersCount, postsCount, consultationsCount] = await Promise.all([
        db.follow.count({ where: { followingId: d.id } }),
        db.post.count({ where: { authorId: d.id } }),
        db.consultation.count({
          where: { doctorId: d.id, status: 'active' },
        }),
      ])
      return { ...d, followersCount, postsCount, consultationsCount }
    })
  )

  // Extract unique specialties for filter dropdown
  const specialties = Array.from(
    new Set(
      doctors
        .map((d) => d.specialty)
        .filter((s): s is string => !!s && s.length > 0)
    )
  ).sort()

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
    specialties,
  })
}
