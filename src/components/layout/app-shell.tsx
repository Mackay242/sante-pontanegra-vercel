import { BottomNav, TopNav } from './navbar'
import { Footer } from './footer'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      {/* Mobile top safe area spacer (visible only in standalone PWA mode) */}
      <div className="h-safe-top bg-primary lg:hidden [display:none] [@media(display-mode:standalone)]:block" />
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
