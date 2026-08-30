import { and, desc, eq } from 'drizzle-orm'
import { db } from '../client'
import { transactions } from '../schema'

export interface NewTransactionInput {
  userId: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: 'Sales' | 'Inventory' | 'Rent' | 'Operational' | 'Other'
  description?: string
  rawTranscript?: string
  language?: 'sw' | 'en'
  source: 'VOICE' | 'MANUAL'
  confidence?: number
}

/**
 * Server-only data-access layer. Every function is scoped by userId —
 * callers must derive it from the authenticated session (Phase 3), never
 * from client-supplied input (AGENTS.md § 3).
 */
export async function createTransaction(input: NewTransactionInput) {
  const [created] = await db.insert(transactions).values(input).returning()
  return created
}

export async function listTransactions(userId: string) {
  return db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: desc(transactions.createdAt),
  })
}

export async function getTransaction(userId: string, id: string) {
  return db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
  })
}

export interface UpdateTransactionInput {
  type?: 'INCOME' | 'EXPENSE'
  amount?: number
  category?: 'Sales' | 'Inventory' | 'Rent' | 'Operational' | 'Other'
  description?: string
  status?: 'PENDING' | 'CONFIRMED' | 'SYNCED'
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: UpdateTransactionInput,
) {
  const [updated] = await db
    .update(transactions)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
  return updated
}

export async function deleteTransaction(userId: string, id: string) {
  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
  return deleted
}
