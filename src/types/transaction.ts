/**
 * View-layer shape only — the persisted schema (Drizzle, Neon) lands in
 * Phase 2 and will map onto this for display.
 */
export type TransactionType = 'INCOME' | 'EXPENSE'

export type TransactionCategory = 'Sales' | 'Inventory' | 'Rent' | 'Operational' | 'Other'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: TransactionCategory
  description: string
  createdAt: string
}
