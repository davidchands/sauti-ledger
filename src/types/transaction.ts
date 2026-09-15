import type { CurrencyCode } from '@/lib/currency'

/**
 * View-layer shape only — the persisted schema (Drizzle, Neon) maps
 * onto this for display.
 */
export type TransactionType = 'INCOME' | 'EXPENSE'

export type TransactionCategory = 'Sales' | 'Inventory' | 'Rent' | 'Operational' | 'Other'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  /** The currency `amount` was actually recorded in — set once at creation from the app's currency setting at that moment, never edited afterward. */
  currency: CurrencyCode
  /** Exchange-rate snapshot frozen at creation time (server/lib/exchangeRates.ts) — how this transaction converts to any of the app's other currencies, forever, regardless of today's rates. */
  rateUsdToTzs: number
  rateEurToTzs: number
  category: TransactionCategory
  description: string
  /** How many units, only when the speaker actually said a count ("5 bags") — null otherwise, never guessed. */
  quantity?: number | null
  unit?: string | null
  createdAt: string
}

export type TransactionDraft = Pick<
  Transaction,
  'type' | 'amount' | 'category' | 'description' | 'quantity' | 'unit'
>
