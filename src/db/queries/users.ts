import { eq } from 'drizzle-orm'
import { db } from '../client'
import { users } from '../schema'

/**
 * Server-only. Full phone OTP auth lands in Phase 3 — this just gives
 * Phase 2 a way to obtain a valid user_id to scope transactions to.
 */
export async function getOrCreateUserByPhone(phoneNumber: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  })
  if (existing) return existing

  const [created] = await db.insert(users).values({ phoneNumber }).returning()
  return created
}
