/**
 * Web Push notification service.
 * Server-side only.
 *
 * VAPID keys generation:
 *   npx web-push generate-vapid-keys
 *
 * Configure env vars:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 */

import webpush from 'web-push'
import { db } from '@/lib/db'

let configured = false

function configure() {
  if (configured) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured')
  }

  webpush.setVapidDetails(
    appUrl,
    publicKey,
    privateKey
  )
  configured = true
}

export type PushSubscriptionInput = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Save a push subscription for the given user.
 */
export async function saveSubscription(
  userId: string,
  sub: PushSubscriptionInput
): Promise<void> {
  configure()
  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      userId,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    create: {
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  })
}

/**
 * Remove a push subscription by endpoint.
 */
export async function removeSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  await db.pushSubscription.deleteMany({
    where: { userId, endpoint },
  })
}

/**
 * Send a push notification to a user (all their subscriptions).
 *
 * @param userId - Recipient user ID
 * @param payload - Notification content
 */
export async function sendPushToUser(
  userId: string,
  payload: {
    title: string
    body: string
    url?: string
    tag?: string
  }
): Promise<void> {
  configure()

  const subs = await db.pushSubscription.findMany({
    where: { userId },
  })

  if (subs.length === 0) return

  const payloadStr = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payloadStr
        )
      } catch (err: unknown) {
        // If subscription is no longer valid (410 Gone), remove it
        if (
          err &&
          typeof err === 'object' &&
          'statusCode' in err &&
          (err as { statusCode: number }).statusCode === 410
        ) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
        // Otherwise ignore — user may have multiple devices
      }
    })
  )
}

/**
 * Check if VAPID is configured.
 */
export function isPushConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    !!process.env.VAPID_PRIVATE_KEY
  )
}
