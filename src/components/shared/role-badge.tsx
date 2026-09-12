'use client'

import { Badge } from '@/components/ui/badge'
import { Stethoscope, Cross, Shield, BadgeCheck } from 'lucide-react'
import type { Role } from '@/lib/roles'

const ROLE_STYLES: Record<Role, { className: string; icon: React.ElementType }> = {
  USER: { className: 'bg-muted text-muted-foreground', icon: BadgeCheck },
  NURSE: {
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    icon: Cross,
  },
  DOCTOR: {
    className: 'bg-primary/10 text-primary',
    icon: Stethoscope,
  },
  ADMIN: {
    className: 'bg-destructive/10 text-destructive',
    icon: Shield,
  },
}

/**
 * Compact badge showing the user's role with an icon.
 * Shows on posts, comments, profiles.
 */
export function RoleBadge({
  role,
  specialty,
  showSpecialty = true,
  size = 'sm',
}: {
  role: Role
  specialty?: string | null
  showSpecialty?: boolean
  size?: 'xs' | 'sm' | 'md'
}) {
  const style = ROLE_STYLES[role]
  const Icon = style.icon

  // Hide badge for regular users (no need to show "USER")
  if (role === 'USER') return null

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${style.className} ${sizeClasses[size]}`}
      title={specialty ?? undefined}
    >
      <Icon className={iconSizes[size]} />
      <span>{role === 'DOCTOR' ? 'Dr.' : role === 'NURSE' ? 'Infirmier(ère)' : 'Admin'}</span>
      {showSpecialty && specialty && (
        <span className="font-normal opacity-80">· {specialty}</span>
      )}
    </span>
  )
}

/**
 * Avatar with optional medical ring (for DOCTOR/NURSE).
 */
export function RoleAvatar({
  name,
  role,
  avatarUrl,
  size = 'md',
}: {
  name: string
  role: Role
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-20 w-20 text-3xl',
  }

  const isMedical = role === 'DOCTOR' || role === 'NURSE'
  const ringClass =
    role === 'DOCTOR'
      ? 'ring-2 ring-primary ring-offset-2'
      : role === 'NURSE'
      ? 'ring-2 ring-blue-500 ring-offset-2'
      : role === 'ADMIN'
      ? 'ring-2 ring-destructive ring-offset-2'
      : ''

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-medical-gradient font-bold text-white ${sizes[size]} ${ringClass}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  )
}
