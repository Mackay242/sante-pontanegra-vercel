/**
 * Authentication utilities — server-side only.
 * Provides password hashing, JWT signing/verification, and session helpers.
 * Compatible with Vercel serverless functions (stateless JWT sessions).
 */

import { compare, hash } from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'sante_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days (seconds)

export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

export type SafeUser = SessionUser

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

/**
 * Verify a password against its hash.
 */
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed)
}

type SessionTokenPayload = JwtPayload & SessionUser

/**
 * Sign a JWT session token.
 */
export function signSession(user: SessionUser): string {
  const secret = getJwtSecret()
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    secret,
    { algorithm: 'HS256', expiresIn: SESSION_MAX_AGE }
  )
}

/**
 * Verify and decode a JWT session token.
 */
export function verifySession(token: string): SessionUser | null {
  try {
    const secret = getJwtSecret()
    const payload = jwt.verify(token, secret) as SessionTokenPayload
    if (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string' &&
      (payload.role === 'USER' || payload.role === 'ADMIN')
    ) {
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Set the session cookie (use in Server Action / Route Handler after login).
 */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = signSession(user)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

/**
 * Clear the session cookie (logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/**
 * Get the currently authenticated user from the request cookies.
 * Returns null when not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

/**
 * Require authentication — throws a tagged error if not authed.
 * Use in server components / route handlers that need a logged-in user.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

/**
 * Require the ADMIN role.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return user
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'replace-me-with-a-long-random-secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production')
    }
    // Dev-only fallback (do NOT use in production)
    return 'dev-only-insecure-secret-change-me'
  }
  return secret
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
