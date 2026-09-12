import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AppShell } from '@/components/layout/app-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Espace personnel',
  description: 'Votre espace santé personnel sur Santé Pontanegra.',
  robots: { index: false, follow: false },
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return <AppShell>{children}</AppShell>
}
