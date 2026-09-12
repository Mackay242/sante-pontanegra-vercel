/**
 * Bot reply tests
 * Run with: bun test tests/bot.test.ts
 */

import { describe, expect, test } from 'bun:test'
import { getBotReply, INITIAL_MESSAGES, BOT_REPLIES } from '../src/lib/data/bot'

describe('getBotReply', () => {
  test('returns a non-empty string', () => {
    const r = getBotReply('Bonjour')
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(0)
  })

  test('mentions paludisme for fever symptoms', () => {
    const r = getBotReply('Je fais de la fièvre')
    expect(r.toLowerCase()).toContain('paludisme')
  })

  test('mentions cough guidance for cough', () => {
    const r = getBotReply('Je tousse depuis hier')
    expect(r.toLowerCase()).toContain('toux')
  })

  test('mentions headache for headache symptoms', () => {
    const r = getBotReply('Mal de tête')
    expect(r.toLowerCase()).toMatch(/t[êe]te|hydratation/)
  })

  test('mentions pregnancy for pregnancy questions', () => {
    const r = getBotReply('Je suis enceinte')
    expect(r.toLowerCase()).toContain('grossesse')
  })

  test('mentions RDV for appointment questions', () => {
    const r = getBotReply('Je veux prendre rdv')
    expect(r.toLowerCase()).toMatch(/rendez-vous|rdv/)
  })

  test('mentions paludisme for malaria', () => {
    const r = getBotReply('Qu\'est-ce que le paludisme ?')
    expect(r.toLowerCase()).toContain('paludisme')
  })
})

describe('INITIAL_MESSAGES', () => {
  test('contains at least 2 bot messages', () => {
    expect(INITIAL_MESSAGES.length).toBeGreaterThanOrEqual(2)
    INITIAL_MESSAGES.forEach((m) => {
      expect(m.role).toBe('bot')
      expect(m.content.length).toBeGreaterThan(0)
    })
  })
})

describe('BOT_REPLIES', () => {
  test('contains default fallback replies', () => {
    expect(BOT_REPLIES.length).toBeGreaterThan(0)
    BOT_REPLIES.forEach((r) => {
      expect(typeof r).toBe('string')
      expect(r.length).toBeGreaterThan(0)
    })
  })
})
