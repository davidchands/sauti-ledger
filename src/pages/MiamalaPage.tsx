import { BalanceCard } from '@/components/BalanceCard'
import { TransactionCard } from '@/components/TransactionCard'
import { VoiceButton } from '@/components/VoiceButton'
import { EmptyState } from '@/components/EmptyState'
import { useLanguage } from '@/i18n/useLanguage'
import { buildSampleTransactions } from '@/lib/sampleTransactions'

// Sample data for design review only — real persistence lands in Phase 2/4.
const sampleTransactions = buildSampleTransactions()

export function MiamalaPage() {
  const { t } = useLanguage()
  const balance = sampleTransactions.reduce(
    (sum, transaction) =>
      sum + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount),
    0,
  )

  return (
    <div className="flex flex-1 flex-col">
      <BalanceCard balance={balance} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <h2 className="mb-1 text-sm font-medium text-text-muted">{t('today.label')}</h2>

        {sampleTransactions.length === 0 ? (
          <EmptyState message={t('miamala.empty')} hint={t('mic.idleHint')} />
        ) : (
          <div className="divide-y divide-border">
            {sampleTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center py-6">
        <VoiceButton state="idle" />
      </div>
    </div>
  )
}
