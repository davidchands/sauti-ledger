import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { getOrCreateUserByPhone } from './users'
import {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from './transactions'
import { db } from '../client'
import { users } from '../schema'
import { eq } from 'drizzle-orm'

// Integration test against the real Neon database configured via
// DATABASE_URL. Proves the Phase 2 definition of done: full CRUD for an
// authenticated user's transactions.
const TEST_PHONE = '+255700000999'

describe('transaction CRUD', () => {
  let userId: string

  beforeAll(async () => {
    const user = await getOrCreateUserByPhone(TEST_PHONE)
    userId = user.id
  })

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, userId))
  })

  it('creates, reads, updates, and deletes a transaction', async () => {
    const created = await createTransaction({
      userId,
      type: 'INCOME',
      amount: 25000,
      category: 'Sales',
      description: 'Mchele',
      source: 'MANUAL',
    })
    expect(created.amount).toBe(25000)
    expect(created.userId).toBe(userId)

    const found = await getTransaction(userId, created.id)
    expect(found?.id).toBe(created.id)

    const list = await listTransactions(userId)
    expect(list.some((t) => t.id === created.id)).toBe(true)

    const updated = await updateTransaction(userId, created.id, { amount: 30000 })
    expect(updated.amount).toBe(30000)

    const deleted = await deleteTransaction(userId, created.id)
    expect(deleted.id).toBe(created.id)

    const afterDelete = await getTransaction(userId, created.id)
    expect(afterDelete).toBeUndefined()
  })

  it('never returns another user\'s transaction', async () => {
    const otherUser = await getOrCreateUserByPhone('+255700000998')
    const created = await createTransaction({
      userId: otherUser.id,
      type: 'EXPENSE',
      amount: 10000,
      category: 'Rent',
      source: 'MANUAL',
    })

    const found = await getTransaction(userId, created.id)
    expect(found).toBeUndefined()

    await deleteTransaction(otherUser.id, created.id)
    await db.delete(users).where(eq(users.id, otherUser.id))
  })
})
