import { useState, type ReactNode } from 'react'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionCard } from '@/components/TransactionCard'
import { VoiceButton, type VoiceButtonState } from '@/components/VoiceButton'
import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { CashFlowSummary } from '@/components/CashFlowSummary'
import { TopLeakCard } from '@/components/TopLeakCard'
import { useLanguage } from '@/i18n/useLanguage'
import { buildSampleTransactions } from '@/lib/sampleTransactions'

const VOICE_STATES: VoiceButtonState[] = ['idle', 'recording', 'processing', 'success', 'error']

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border py-6">
      <h2 className="mb-4 px-5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h2>
      <div className="px-5">{children}</div>
    </section>
  )
}

/**
 * Internal-only QA page for reviewing every component state from
 * DESIGN.md side by side. Not linked from BottomNavigation.
 */
export function DesignSystemPage() {
  const { t } = useLanguage()
  const sampleTransactions = buildSampleTransactions()
  const [showConfirmation, setShowConfirmation] = useState(false)

  return (
    <div className="pb-16">
      <Section title="Balance">
        <BalanceCard balance={183500} />
      </Section>

      <Section title="Transaction cards">
        <div className="divide-y divide-border rounded-2xl bg-surface px-4">
          {sampleTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </Section>

      <Section title="Voice button states">
        <div className="flex flex-wrap gap-6">
          {VOICE_STATES.map((state) => (
            <VoiceButton key={state} state={state} />
          ))}
        </div>
      </Section>

      <Section title="Confirmation card">
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text"
        >
          Show confirmation
        </button>
        {showConfirmation && (
          <TransactionConfirmation
            draft={{ type: 'INCOME', amount: 25000, category: 'Sales', description: 'Mchele' }}
            onConfirm={() => setShowConfirmation(false)}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </Section>

      <Section title="Empty state">
        <EmptyState message={t('miamala.empty')} hint={t('mic.idleHint')} />
      </Section>

      <Section title="Loading state">
        <LoadingIndicator message={t('mic.processing')} />
      </Section>

      <Section title="Error state">
        <ErrorState onRetry={() => {}} />
      </Section>

      <Section title="Cash flow summary">
        <CashFlowSummary income={180000} expense={72000} />
      </Section>

      <Section title="Top leak">
        <TopLeakCard
          leaks={[
            { category: 'Inventory', amount: 60000 },
            { category: 'Operational', amount: 10000 },
          ]}
        />
      </Section>
    </div>
  )
}
