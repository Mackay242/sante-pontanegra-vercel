#!/usr/bin/env node
/**
 * Generate production secrets for Santé Pontanegra.
 * Run with: node scripts/generate-secrets.mjs
 *
 * Outputs ready-to-paste values for Vercel environment variables.
 */

import { randomBytes } from 'crypto'
import webPush from 'web-push'

console.log('🔐 Santé Pontanegra — Production Secrets Generator')
console.log('='.repeat(60))
console.log('')
console.log('Copy these values into your Vercel project settings:')
console.log('(Settings → Environment Variables)')
console.log('')
console.log('-'.repeat(60))

// JWT_SECRET (256-bit base64)
const jwtSecret = randomBytes(48).toString('base64')
console.log(`JWT_SECRET="${jwtSecret}"`)
console.log('')

// NEXT_PUBLIC_APP_URL placeholder
console.log('# Replace with your Vercel deployment URL after first deploy')
console.log('NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"')
console.log('')

// Database URL placeholder
console.log('# Get from Neon: https://neon.tech → Create Project')
console.log('# Format: postgresql://user:password@host/dbname?sslmode=require')
console.log('DATABASE_URL="postgresql://..."')
console.log('')

// ENABLE_LLM_CHAT (optional)
console.log('# Optional: enable AI-powered medical chat (z-ai-web-dev-sdk)')
console.log('ENABLE_LLM_CHAT="true"')
console.log('')

// VAPID keys for push notifications
console.log('# Optional: Web Push notifications')
console.log('# Generate with: npx web-push generate-vapid-keys')
try {
  const vapidKeys = webPush.generateVAPIDKeys()
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
  console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
} catch (err) {
  console.log('# Run `npx web-push generate-vapid-keys` to get VAPID keys')
}

console.log('')
console.log('-'.repeat(60))
console.log('📝 Next steps:')
console.log('1. Create a PostgreSQL database on Neon (https://neon.tech)')
console.log('2. Copy your DATABASE_URL from Neon dashboard')
console.log('3. Push your code to GitHub: git push origin main')
console.log('4. Go to https://vercel.com/new and import your repo')
console.log('5. Paste all the values above into Vercel Env Variables')
console.log('6. Deploy!')
console.log('7. After first deploy: run `DATABASE_URL=... npm run db:push`')
console.log('   to create the database tables on production')
console.log('')
console.log('⚠️  NEVER commit these secrets to git.')
console.log('='.repeat(60))
