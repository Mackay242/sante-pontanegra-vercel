import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Santé Pontanegra — Votre santé, notre priorité',
    template: '%s · Santé Pontanegra',
  },
  description:
    "Plateforme de santé numérique pour Pointe-Noire, Congo. Trouvez un centre de soin, parlez à un médecin, suivez votre dossier médical, et accédez à des vidéos de sensibilisation santé.",
  keywords: [
    'santé',
    'Pointe-Noire',
    'Congo',
    'médecin',
    'centres de santé',
    'vaccination',
    'dossier médical',
    'télémedecine',
    'communauté santé',
  ],
  authors: [{ name: 'Santé Pontanegra' }],
  creator: 'Santé Pontanegra',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Santé Pontanegra',
    description:
      'Votre santé, notre priorité à Pointe-Noire. Centres de santé, médecin en ligne, dossier médical, vaccination.',
    url: '/',
    siteName: 'Santé Pontanegra',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santé Pontanegra',
    description:
      'Plateforme de santé pour Pointe-Noire, Congo.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export const viewport = {
  themeColor: '#0d7a5f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
