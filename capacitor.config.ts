import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor configuration for Santé Pontanegra
 *
 * Mode: "Hybrid wrapper" — loads the live Vercel URL in a native webview.
 * This allows the app to keep all backend features (API routes, Prisma, DB)
 * while giving access to native device features (camera, share, haptics, etc.)
 *
 * For offline support, the service worker (public/sw.js) caches the app shell
 * and visited pages automatically.
 */
const config: CapacitorConfig = {
  appId: 'cg.santepontanegra.app',
  appName: 'Santé Pontanegra',
  webDir: 'public',
  // Bundle assets but use remote URL for backend
  server: {
    // Live production URL — the app loads from Vercel
    url: 'https://sante-pontanegra-vercel.vercel.app',
    // Allow cleartext for localhost dev (production uses HTTPS)
    cleartext: false,
    // Force live URL even in dev
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content if needed (we're HTTPS only, so no)
    allowMixedContent: false,
    // Background color while webview loads
    backgroundColor: '#0d7a5f',
    // Enable webview debugging in dev only
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      // Show splash for 1.5s (in case of slow network)
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0d7a5f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'LARGE',
      iosSpinnerStyle: 'SMALL',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // Color the status bar to match app theme
      backgroundColor: '#0d7a5f',
      style: 'LIGHT', // white text on green
      overlaysWebView: false,
    },
    Camera: {
      // Ask for permissions on Android 13+
      permissions: ['camera', 'photos'],
    },
    Geolocation: {
      permissions: ['location'],
    },
  },
}

export default config
