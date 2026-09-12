import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to verify database connectivity.
 * GET /api/debug/db
 *
 * Returns:
 * - 200 if connection is OK and tables exist
 * - 500 with error details if something is wrong
 */
export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPreview: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL.slice(0, 30)}...`
        : 'NOT SET',
      databaseProvider: process.env.DATABASE_URL?.startsWith('postgres')
        ? 'postgresql'
        : process.env.DATABASE_URL?.startsWith('file:')
        ? 'sqlite'
        : 'unknown',
      nodeEnv: process.env.NODE_ENV,
    },
    connection: 'pending' as 'pending' | 'ok' | 'failed',
    tables: {} as Record<string, number | string>,
    error: null as string | null,
  }

  try {
    // Try a simple query
    await db.$queryRaw`SELECT 1 as test`
    results.connection = 'ok'

    // Count rows in each table
    const tableNames = [
      'User',
      'Post',
      'Comment',
      'MedicalDossier',
      'Appointment',
      'Vaccination',
      'Pregnancy',
      'ChatMessage',
      'PushSubscription',
    ]

    // Use type assertion for dynamic table access
    const dbAny = db as unknown as Record<
      string,
      { count: () => Promise<number> }
    >

    for (const table of tableNames) {
      try {
        const count = await dbAny[table].count()
        results.tables[table] = count
      } catch (err) {
        results.tables[table] = `ERROR: ${
          err instanceof Error ? err.message : 'unknown'
        }`
      }
    }
  } catch (err) {
    results.connection = 'failed'
    results.error = err instanceof Error ? err.message : String(err)
  }

  const status = results.connection === 'ok' ? 200 : 500
  return NextResponse.json(results, { status })
}
