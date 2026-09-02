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
