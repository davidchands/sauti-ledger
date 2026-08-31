import type { ReactNode } from 'react'
import { useTransactions } from './useTransactions'
import { TransactionsContext } from './transactionsContext'

/**
 * Single shared instance of useTransactions so Miamala, Ripoti, and the
 * global SyncIndicator all see the same pending/online state — each page
 * calling the hook independently would fetch separately and could show
 * inconsistent sync status depending on which tab you're on.
 */
export function TransactionsProvider({ children }: { children: ReactNode }) {
  const value = useTransactions()
  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
}
