import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { PWAInstaller } from '@/components/pwa-installer'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { BackButtonHandler } from '@/components/back-button-handler'

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
    "Plateforme de santé numérique pour Pointe-Noire, Congo. Trouvez un centre de soin, parlez à un médecin IA, suivez votre dossier médical, et accédez à des vidéos de sensibilisation santé.",
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Santé Pontanegra',
    statusBarStyle: 'default',
    startupImage: [
      '/icons/apple-touch-icon.png',
    ],
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  applicationName: 'Santé Pontanegra',
  openGraph: {
    title: 'Santé Pontanegra',
    description:
      'Votre santé, notre priorité à Pointe-Noire. Centres de santé, médecin IA, dossier médical, vaccination.',
    url: '/',
    siteName: 'Santé Pontanegra',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Santé Pontanegra',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santé Pontanegra',
    description:
      'Plateforme de santé pour Pointe-Noire, Congo.',
    images: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: ['/favicon-32.png'],
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d7a5f' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1923' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  viewportFit: 'cover', // For notched devices (safe-area)
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* PWA: iOS standalone mode */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Santé Pontanegra" />
        <meta name="application-name" content="Santé Pontanegra" />
        {/* Force light background on iOS launch */}
        <meta name="apple-mobile-web-app-status-bar" content="#0d7a5f" />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <PWAInstaller />
            <OfflineIndicator />
            <BackButtonHandler />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
