import { CashFlowSummary } from '@/components/CashFlowSummary'
import { TopLeakCard } from '@/components/TopLeakCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactions } from '@/hooks/useTransactions'
import type { TransactionCategory } from '@/types/transaction'

function isThisWeek(iso: string): boolean {
  const date = new Date(iso)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return date >= weekStart
}

export function RipotiPage() {
  const { t } = useLanguage()
  const { transactions, state, refresh } = useTransactions()

  if (state === 'loading') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <LoadingIndicator message={t('miamala.loading')} />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <ErrorState onRetry={refresh} />
      </div>
    )
  }

  const weekly = transactions.filter((tx) => isThisWeek(tx.createdAt))

  if (weekly.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <EmptyState message={t('ripoti.empty')} />
      </div>
    )
  }

  const income = weekly
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const expense = weekly
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expenseByCategory = new Map<TransactionCategory, number>()
  for (const transaction of weekly) {
    if (transaction.type !== 'EXPENSE') continue
    expenseByCategory.set(
      transaction.category,
      (expenseByCategory.get(transaction.category) ?? 0) + transaction.amount,
    )
  }
  const leaks = [...expenseByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }))

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8">
      <h1 className="pt-6 text-2xl font-semibold text-text">{t('nav.ripoti')}</h1>
      <p className="mt-1 text-sm text-text-muted">{t('ripoti.thisWeek')}</p>

      <div className="mt-4">
        <CashFlowSummary income={income} expense={expense} />
      </div>

      {leaks.length > 0 && (
        <div className="mt-8">
          <TopLeakCard leaks={leaks} />
        </div>
      )}
    </div>
  )
}
