/**
 * Auth utilities tests
 * Run with: bun test tests/auth.test.ts
 */

import { describe, expect, test } from 'bun:test'
import {
  hashPassword,
  verifyPassword,
  signSession,
  verifySession,
  type SessionUser,
} from '../src/lib/auth'

const mockUser: SessionUser = {
  id: 'user-1',
  email: 'test@sante.cg',
  name: 'Test User',
  role: 'USER',
}

describe('password hashing', () => {
  test('hashes and verifies password', async () => {
    const password = 'mySecret123'
    const hash = await hashPassword(password)
    expect(hash).not.toBe(password)
    expect(await verifyPassword(password, hash)).toBe(true)
  })

  test('rejects wrong password', async () => {
    const hash = await hashPassword('correct')
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })

  test('produces different hashes for same password (salt)', async () => {
    const h1 = await hashPassword('same')
    const h2 = await hashPassword('same')
    expect(h1).not.toBe(h2)
  })
})

describe('JWT sessions', () => {
  test('signs and verifies a session', () => {
    const token = signSession(mockUser)
    expect(typeof token).toBe('string')

    const payload = verifySession(token)
    expect(payload).not.toBeNull()
    expect(payload?.id).toBe(mockUser.id)
    expect(payload?.email).toBe(mockUser.email)
    expect(payload?.name).toBe(mockUser.name)
    expect(payload?.role).toBe(mockUser.role)
  })

  test('rejects invalid token', () => {
    expect(verifySession('not-a-token')).toBeNull()
  })

  test('rejects token signed with different secret', () => {
    const token = signSession(mockUser)
    // Tamper with token
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(verifySession(tampered)).toBeNull()
  })
})
