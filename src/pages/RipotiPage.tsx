import { CashFlowSummary } from '@/components/CashFlowSummary'
import { TopLeakCard } from '@/components/TopLeakCard'
import { EmptyState } from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { buildSampleTransactions } from '@/lib/sampleTransactions'
import type { TransactionCategory } from '@/types/transaction'

// Sample data for design review only — real aggregation lands in Phase 10.
const sampleTransactions = buildSampleTransactions()

export function RipotiPage() {
  const { t } = useLanguage()

  const income = sampleTransactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const expense = sampleTransactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expenseByCategory = new Map<TransactionCategory, number>()
  for (const transaction of sampleTransactions) {
    if (transaction.type !== 'EXPENSE') continue
    expenseByCategory.set(
      transaction.category,
      (expenseByCategory.get(transaction.category) ?? 0) + transaction.amount,
    )
  }
  const leaks = [...expenseByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }))

  if (sampleTransactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <EmptyState message={t('ripoti.empty')} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-8">
      <h1 className="pt-6 text-2xl font-semibold text-text">{t('nav.ripoti')}</h1>
      <p className="mt-1 text-sm text-text-muted">{t('ripoti.thisWeek')}</p>

      <div className="mt-4">
        <CashFlowSummary income={income} expense={expense} />
      </div>

      <div className="mt-8">
        <TopLeakCard leaks={leaks} />
      </div>
    </div>
  )
}
