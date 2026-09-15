import { BalanceCard } from '@/components/BalanceCard'
import { CashFlowSummary } from '@/components/CashFlowSummary'
import { TopLeakCard } from '@/components/TopLeakCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactionsContext } from '@/hooks/useTransactionsContext'
import { useCurrency } from '@/currency/useCurrency'
import { computeBalance, convertTransactionAmount } from '@/lib/currency'
import type { TransactionCategory } from '@/types/transaction'

function isThisWeek(iso: string): boolean {
  const date = new Date(iso)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return date >= weekStart
}

/**
 * Answers the four questions DESIGN.md § 18 sets out: Nina kiasi gani?
 * (balance — shown regardless of this week's activity), Wiki hii
 * nimeingiza kiasi gani? (income), Nimetumia kiasi gani? (expenses),
 * Pesa yangu inaishia wapi? (biggest leak).
 */
export function RipotiPage() {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const { transactions, state, refresh } = useTransactionsContext()

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

  if (transactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <EmptyState message={t('ripoti.empty')} />
      </div>
    )
  }

  const balance = computeBalance(transactions, currency)
  const weekly = transactions.filter((tx) => isThisWeek(tx.createdAt))

  const income = weekly
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + convertTransactionAmount(tx, currency), 0)
  const expense = weekly
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + convertTransactionAmount(tx, currency), 0)

  const expenseByCategory = new Map<TransactionCategory, number>()
  for (const transaction of weekly) {
    if (transaction.type !== 'EXPENSE') continue
    expenseByCategory.set(
      transaction.category,
      (expenseByCategory.get(transaction.category) ?? 0) +
        convertTransactionAmount(transaction, currency),
    )
  }
  const leaks = [...expenseByCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }))
  const topLeak = leaks[0]

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <BalanceCard balance={balance} />

      <div className="px-5 pt-4">
        <h2 className="text-sm font-medium text-text-muted">{t('ripoti.thisWeek')}</h2>

        {weekly.length === 0 ? (
          <p className="mt-4 text-center text-sm text-text-muted">
            {t('ripoti.thisWeekEmpty')}
          </p>
        ) : (
          <>
            <div className="mt-4">
              <CashFlowSummary income={income} expense={expense} />
            </div>

            {topLeak && (
              <div className="mt-8">
                <TopLeakCard leaks={leaks} />
                <p className="mt-3 text-sm text-text-muted">
                  {t(`category.${topLeak.category}`)} {t('ripoti.leakInsightSuffix')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
