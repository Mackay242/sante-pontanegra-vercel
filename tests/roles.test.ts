/**
 * Roles & permissions tests
 * Run with: bun test tests/roles.test.ts
 */

import { describe, expect, test } from 'bun:test'
import {
  ALL_ROLES,
  hasPermission,
  hasMinimumRole,
  isMedicalRole,
  ROLE_LABELS,
  type Role,
} from '../src/lib/roles'

describe('ALL_ROLES', () => {
  test('contains 4 roles', () => {
    expect(ALL_ROLES).toHaveLength(4)
    expect(ALL_ROLES).toContain('USER')
    expect(ALL_ROLES).toContain('NURSE')
    expect(ALL_ROLES).toContain('DOCTOR')
    expect(ALL_ROLES).toContain('ADMIN')
  })
})

describe('hasMinimumRole', () => {
  test('USER has minimum USER', () => {
    expect(hasMinimumRole('USER', 'USER')).toBe(true)
  })

  test('USER does not have minimum ADMIN', () => {
    expect(hasMinimumRole('USER', 'ADMIN')).toBe(false)
  })

  test('ADMIN has minimum for all roles', () => {
    expect(hasMinimumRole('ADMIN', 'USER')).toBe(true)
    expect(hasMinimumRole('ADMIN', 'NURSE')).toBe(true)
    expect(hasMinimumRole('ADMIN', 'DOCTOR')).toBe(true)
    expect(hasMinimumRole('ADMIN', 'ADMIN')).toBe(true)
  })

  test('DOCTOR has minimum NURSE but not ADMIN', () => {
    expect(hasMinimumRole('DOCTOR', 'NURSE')).toBe(true)
    expect(hasMinimumRole('DOCTOR', 'ADMIN')).toBe(false)
  })

  test('NURSE has minimum USER but not DOCTOR', () => {
    expect(hasMinimumRole('NURSE', 'USER')).toBe(true)
    expect(hasMinimumRole('NURSE', 'DOCTOR')).toBe(false)
  })
})

describe('isMedicalRole', () => {
  test('returns true for NURSE and DOCTOR', () => {
    expect(isMedicalRole('NURSE')).toBe(true)
    expect(isMedicalRole('DOCTOR')).toBe(true)
  })

  test('returns false for USER and ADMIN', () => {
    expect(isMedicalRole('USER')).toBe(false)
    expect(isMedicalRole('ADMIN')).toBe(false)
  })
})

describe('hasPermission', () => {
  test('USER can use chat', () => {
    expect(hasPermission('USER', 'USE_CHAT')).toBe(true)
  })

  test('USER cannot view other dossiers', () => {
    expect(hasPermission('USER', 'VIEW_OTHER_DOSSIERS')).toBe(false)
  })

  test('DOCTOR can view other dossiers', () => {
    expect(hasPermission('DOCTOR', 'VIEW_OTHER_DOSSIERS')).toBe(true)
  })

  test('NURSE can view other dossiers', () => {
    expect(hasPermission('NURSE', 'VIEW_OTHER_DOSSIERS')).toBe(true)
  })

  test('ADMIN can manage users', () => {
    expect(hasPermission('ADMIN', 'MANAGE_USERS')).toBe(true)
  })

  test('DOCTOR cannot manage users', () => {
    expect(hasPermission('DOCTOR', 'MANAGE_USERS')).toBe(false)
  })

  test('USER cannot ban user', () => {
    expect(hasPermission('USER', 'BAN_USER')).toBe(false)
  })

  test('All roles can post in community', () => {
    const roles: Role[] = ['USER', 'NURSE', 'DOCTOR', 'ADMIN']
    roles.forEach((r) => {
      expect(hasPermission(r, 'POST_COMMUNITY')).toBe(true)
    })
  })
})

describe('ROLE_LABELS', () => {
  test('all roles have a label', () => {
    ALL_ROLES.forEach((role) => {
      const label = ROLE_LABELS[role]
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })
  })
})
