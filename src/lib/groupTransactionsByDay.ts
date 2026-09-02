import type { Transaction } from '@/types/transaction'

export interface TransactionDayGroup {
  /** ISO date (midnight) of this group — stable React key. */
  key: string
  date: Date
  items: Transaction[]
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/**
 * Buckets transactions by calendar day so the list reads "Leo / Jana /
 * Aug 12" instead of one long undifferentiated stack. Transactions
 * within each day stay in the order they were passed in (callers
 * already sort newest-first).
 */
export function groupTransactionsByDay(transactions: Transaction[]): TransactionDayGroup[] {
  const groups = new Map<string, TransactionDayGroup>()

  for (const transaction of transactions) {
    const day = startOfDay(new Date(transaction.createdAt))
    const key = day.toISOString()
    const existing = groups.get(key)
    if (existing) {
      existing.items.push(transaction)
    } else {
      groups.set(key, { key, date: day, items: [transaction] })
    }
  }

  return [...groups.values()].sort((a, b) => b.date.getTime() - a.date.getTime())
}

/** "Leo" / "Jana" / a formatted date, depending on how far back the group is. */
export function dayGroupLabel(
  date: Date,
  language: 'sw' | 'en',
  labels: { today: string; yesterday: string },
): string {
  const today = startOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.getTime() === today.getTime()) return labels.today
  if (date.getTime() === yesterday.getTime()) return labels.yesterday

  return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}
