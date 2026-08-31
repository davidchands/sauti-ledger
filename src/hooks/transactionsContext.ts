import { createContext } from 'react'
import type { useTransactions } from './useTransactions'

export type TransactionsValue = ReturnType<typeof useTransactions>

export const TransactionsContext = createContext<TransactionsValue | null>(null)
