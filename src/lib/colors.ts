/**
 * Application color tokens, exported as CSS variables
 * and used by Tailwind utility classes via @theme in globals.css.
 */

export const APP_COLORS = {
  primary: '#0d7a5f',       // Vert Sante
  primaryLight: '#1dab84',
  primaryDark: '#0a5e47',
  secondary: '#1a5f7a',     // Bleu médecin
  accent: '#e53935',        // Rouge urgence
  warning: '#f59e0b',
  background: '#daeef6',    // Bleu clair (light)
  backgroundDark: '#0f1923',
  surface: '#ffffff',
  surfaceAlt: '#f5f5f5',
  border: '#e0e0e0',
  textDark: '#1a1a1a',
  textMedium: '#555555',
  textLight: '#999999',
  green: '#22c55e',
  emergencyBg: '#fff5f5',
  emergencyBorder: '#ffd0d0',
  emergencyText: '#e53935',
} as const
