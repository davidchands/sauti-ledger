import { getDb } from '../client'
import { users } from '../schema'

/**
 * Server-only. Kept for when real phone OTP auth lands (AGENTS.md § 3a) —
 * not called anywhere yet.
 *
 * Atomic upsert (INSERT ... ON CONFLICT), not a SELECT-then-INSERT: two
 * concurrent first-time requests for the same brand-new phone number must
 * never both try to insert and have the second fail on the unique
 * constraint — Postgres resolves that race atomically here instead.
 */
export async function getOrCreateUserByPhone(phoneNumber: string) {
  const [user] = await getDb()
    .insert(users)
    .values({ phoneNumber })
    .onConflictDoUpdate({ target: users.phoneNumber, set: { phoneNumber } })
    .returning()
  return user
}

/**
 * Server-only. MVP identity resolution (AGENTS.md § 3a): the client's
 * self-issued device id, sent as the X-Device-Id header, resolves to a
 * users row exactly the way a verified session will once OTP exists.
 *
 * Same atomicity reasoning as getOrCreateUserByPhone above — this was
 * previously a racy SELECT-then-INSERT and would 500 under concurrent
 * first requests for a new device id (caught by e2e/device-isolation.spec.ts).
 */
export async function getOrCreateUserByDeviceId(deviceId: string) {
  const [user] = await getDb()
    .insert(users)
    .values({ deviceId })
    .onConflictDoUpdate({ target: users.deviceId, set: { deviceId } })
    .returning()
  return user
}
