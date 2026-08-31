import { useContext } from 'react'
import { TransactionsContext, type TransactionsValue } from './transactionsContext'

export function useTransactionsContext(): TransactionsValue {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactionsContext must be used within a TransactionsProvider')
  }
  return context
}
