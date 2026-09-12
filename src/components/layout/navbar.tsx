'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, MessageCircle, User, Users, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/data/app'

const TABS = [
  { key: 'dashboard', label: 'Accueil', href: '/dashboard', icon: Home },
  { key: 'communaute', label: 'Communauté', href: '/communaute', icon: Users },
  { key: 'medecin', label: 'Médecin', href: '/medecin', icon: MessageCircle },
  { key: 'centres', label: 'Centres', href: '/centres', icon: MapPin },
  { key: 'profil', label: 'Profil', href: '/profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden pb-safe"
      aria-label="Navigation principale"
    >
      <ul className="grid grid-cols-5 pt-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active =
            pathname === tab.href ||
            (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium tap-feedback transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-primary'
                )}
              >
                <Icon
                  className={cn('h-5 w-5', active && 'fill-primary/15')}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={active ? 'font-semibold' : ''}>{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function TopNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 hidden border-b bg-card/95 backdrop-blur lg:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-gradient">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active =
              pathname === tab.href ||
              (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export function AppHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string
  subtitle?: string
  backHref?: string
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      {backHref && (
        <Link
          href={backHref}
          className="mt-1 rounded-full p-2 hover:bg-muted"
          aria-label="Retour"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}
