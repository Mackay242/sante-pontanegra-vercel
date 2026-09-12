/**
 * Role definitions and permissions for SantePontaNegra.
 *
 * Roles hierarchy:
 * - USER:    Standard user (default at registration)
 * - NURSE:   Infirmier(ère) — can read patient dossiers, manage appointments
 * - DOCTOR:  Médecin — can read/write patient dossiers, prescribe, manage vaccinations
 * - ADMIN:    Administrator — full access + user management
 */

export type Role = 'USER' | 'NURSE' | 'DOCTOR' | 'ADMIN'

export const ALL_ROLES: Role[] = ['USER', 'NURSE', 'DOCTOR', 'ADMIN']

export const ROLE_LABELS: Record<Role, string> = {
  USER: 'Utilisateur',
  NURSE: 'Infirmier(ère)',
  DOCTOR: 'Médecin',
  ADMIN: 'Administrateur',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  USER: 'Accès standard : gérez votre propre dossier médical, rendez-vous et communauté.',
  NURSE:
    'Accès professionnel : consultez les dossiers patients, gérez les rendez-vous et vaccinations.',
  DOCTOR:
    'Accès médical complet : lecture/écriture des dossiers, prescriptions, gestion vaccinale.',
  ADMIN:
    'Accès total : gestion des utilisateurs, modération communauté, configuration.',
}

export const ROLE_COLORS: Record<Role, string> = {
  USER: 'bg-muted text-muted-foreground',
  NURSE: 'bg-blue-100 text-blue-700',
  DOCTOR: 'bg-primary/10 text-primary',
  ADMIN: 'bg-destructive/10 text-destructive',
}

/**
 * Permissions matrix — which roles can perform which actions.
 */
export const PERMISSIONS = {
  // Self
  VIEW_OWN_PROFILE: ALL_ROLES,
  EDIT_OWN_PROFILE: ALL_ROLES,
  VIEW_OWN_DOSSIER: ALL_ROLES,
  EDIT_OWN_DOSSIER: ALL_ROLES,
  MANAGE_OWN_APPOINTMENTS: ALL_ROLES,
  MANAGE_OWN_VACCINATIONS: ALL_ROLES,
  MANAGE_OWN_PREGNANCIES: ALL_ROLES,
  USE_CHAT: ALL_ROLES,
  POST_COMMUNITY: ALL_ROLES,
  COMMENT_COMMUNITY: ALL_ROLES,
  LIKE_COMMUNITY: ALL_ROLES,
  DELETE_OWN_POST: ALL_ROLES,

  // Medical professional
  VIEW_OTHER_DOSSIERS: ['NURSE', 'DOCTOR', 'ADMIN'],
  VIEW_ALL_APPOINTMENTS: ['NURSE', 'DOCTOR', 'ADMIN'],
  CONFIRM_APPOINTMENTS: ['NURSE', 'DOCTOR', 'ADMIN'],
  ADD_VACCINATION_RECORD: ['NURSE', 'DOCTOR', 'ADMIN'],

  // Admin
  MANAGE_USERS: ['ADMIN'],
  DELETE_ANY_POST: ['ADMIN'],
  VIEW_ALL_USERS: ['ADMIN'],
  BAN_USER: ['ADMIN'],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Check if a role has a given permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission]
  return (allowed as readonly string[]).includes(role)
}

/**
 * Check if a role is at least the given minimum role.
 */
export function hasMinimumRole(role: Role, minimum: Role): boolean {
  const order: Role[] = ['USER', 'NURSE', 'DOCTOR', 'ADMIN']
  return order.indexOf(role) >= order.indexOf(minimum)
}

/**
 * Check if a role is a medical professional (nurse or doctor).
 */
export function isMedicalRole(role: Role): boolean {
  return role === 'NURSE' || role === 'DOCTOR'
}
