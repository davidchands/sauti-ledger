import { eq } from 'drizzle-orm'
import { db } from '../client'
import { users } from '../schema'

/**
 * Server-only. Kept for when real phone OTP auth lands (AGENTS.md § 3a) —
 * not called anywhere yet.
 */
export async function getOrCreateUserByPhone(phoneNumber: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  })
  if (existing) return existing

  const [created] = await db.insert(users).values({ phoneNumber }).returning()
  return created
}

/**
 * Server-only. MVP identity resolution (AGENTS.md § 3a): the client's
 * self-issued device id, sent as the X-Device-Id header, resolves to a
 * users row exactly the way a verified session will once OTP exists.
 */
export async function getOrCreateUserByDeviceId(deviceId: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.deviceId, deviceId),
  })
  if (existing) return existing

  const [created] = await db.insert(users).values({ deviceId }).returning()
  return created
}
