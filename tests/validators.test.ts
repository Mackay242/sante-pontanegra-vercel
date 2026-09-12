/**
 * Validation tests — Zod schemas
 * Run with: bun test tests/validators.test.ts
 */

import { describe, expect, test } from 'bun:test'
import {
  loginSchema,
  registerSchema,
  postSchema,
  appointmentSchema,
  chatSchema,
} from '../src/lib/validators'

describe('loginSchema', () => {
  test('accepts valid credentials', () => {
    const r = loginSchema.safeParse({
      email: 'user@test.cg',
      password: 'secret123',
    })
    expect(r.success).toBe(true)
  })

  test('rejects invalid email', () => {
    const r = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    })
    expect(r.success).toBe(false)
  })

  test('rejects empty password', () => {
    const r = loginSchema.safeParse({
      email: 'user@test.cg',
      password: '',
    })
    expect(r.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Marie Koumba',
    phone: '+2420600000000',
    email: 'marie@test.cg',
    password: 'pass123',
    confirm: 'pass123',
  }

  test('accepts valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  test('rejects name shorter than 2 chars', () => {
    expect(
      registerSchema.safeParse({ ...valid, name: 'M' }).success
    ).toBe(false)
  })

  test('rejects invalid phone', () => {
    expect(
      registerSchema.safeParse({ ...valid, phone: 'abc' }).success
    ).toBe(false)
  })

  test('rejects password shorter than 6 chars', () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: 'abc',
        confirm: 'abc',
      }).success
    ).toBe(false)
  })

  test('rejects mismatched passwords', () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        confirm: 'different',
      }).success
    ).toBe(false)
  })
})

describe('postSchema', () => {
  test('accepts valid post', () => {
    expect(
      postSchema.safeParse({
        title: 'Bienvenue à tous',
        content: 'Ceci est un message suffisamment long.',
        category: 'general',
      }).success
    ).toBe(true)
  })

  test('rejects short title', () => {
    expect(
      postSchema.safeParse({
        title: 'Hi',
        content: 'Contenu valide ici.',
        category: 'general',
      }).success
    ).toBe(false)
  })

  test('rejects invalid category', () => {
    expect(
      postSchema.safeParse({
        title: 'Titre valide',
        content: 'Contenu valide ici.',
        category: 'invalid',
      }).success
    ).toBe(false)
  })
})

describe('appointmentSchema', () => {
  test('accepts valid appointment', () => {
    expect(
      appointmentSchema.safeParse({
        centreId: '1',
        centreName: 'Hôpital Général',
        date: new Date().toISOString(),
        motif: 'Consultation',
      }).success
    ).toBe(true)
  })

  test('rejects invalid date', () => {
    expect(
      appointmentSchema.safeParse({
        centreId: '1',
        centreName: 'Hôpital',
        date: 'not-a-date',
        motif: 'Consultation',
      }).success
    ).toBe(false)
  })
})

describe('chatSchema', () => {
  test('accepts valid message', () => {
    expect(chatSchema.safeParse({ message: 'Bonjour' }).success).toBe(true)
  })

  test('rejects empty message', () => {
    expect(chatSchema.safeParse({ message: '' }).success).toBe(false)
  })

  test('rejects too long message', () => {
    expect(
      chatSchema.safeParse({ message: 'x'.repeat(1001) }).success
    ).toBe(false)
  })
})
