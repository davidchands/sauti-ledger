import type { Transaction } from '@/types/transaction'
import { convertTransactionAmount, type CurrencyCode } from '@/lib/currency'

export interface DailySummary {
  income: number
  expense: number
  /** Running balance through the end of this day — every transaction up to and including it, not just this day's net. */
  closingBalance: number
}

function endOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Income/expense for exactly this day, plus the closing balance — the
 * running total through the end of this day, so a merchant looking at a
 * past day sees what their balance actually was then, not just that
 * day's net movement. Every transaction converts into `currency` via
 * its own frozen rate snapshot before being summed (src/lib/currency.ts).
 */
export function computeDailySummary(
  transactions: Transaction[],
  day: Date,
  currency: CurrencyCode,
): DailySummary {
  const cutoff = endOfDay(day)
  let income = 0
  let expense = 0
  let closingBalance = 0

  for (const tx of transactions) {
    const createdAt = new Date(tx.createdAt)
    if (createdAt > cutoff) continue

    const amount = convertTransactionAmount(tx, currency)
    closingBalance += tx.type === 'INCOME' ? amount : -amount

    if (isSameDay(createdAt, day)) {
      if (tx.type === 'INCOME') income += amount
      else expense += amount
    }
  }

  return { income, expense, closingBalance }
}
