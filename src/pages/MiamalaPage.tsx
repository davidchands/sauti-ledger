import { useState } from 'react'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionCard } from '@/components/TransactionCard'
import { VoiceButton } from '@/components/VoiceButton'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { TransactionSheet } from '@/components/TransactionSheet'
import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { VoiceRecorderSheet, type VoiceExtraction } from '@/components/VoiceRecorderSheet'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactions } from '@/hooks/useTransactions'
import type { TransactionDraft } from '@/components/TransactionFields'
import type { Transaction } from '@/types/transaction'

const BLANK_DRAFT: TransactionDraft = {
  type: 'INCOME',
  amount: 0,
  category: 'Sales',
  description: '',
}

export function MiamalaPage() {
  const { t } = useLanguage()
  const { transactions, balance, state, refresh, create, update, remove } = useTransactions()
  const [sheet, setSheet] = useState<
    { mode: 'create' } | { mode: 'edit'; transaction: Transaction } | null
  >(null)
  const [saving, setSaving] = useState(false)
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [voiceExtraction, setVoiceExtraction] = useState<VoiceExtraction | null>(null)

  const closeSheet = () => setSheet(null)

  const handleSave = async (draft: TransactionDraft) => {
    setSaving(true)
    const ok =
      sheet?.mode === 'edit'
        ? await update(sheet.transaction.id, draft)
        : await create(draft)
    setSaving(false)
    if (ok) closeSheet()
  }

  const handleDelete = async () => {
    if (sheet?.mode !== 'edit') return
    setSaving(true)
    const ok = await remove(sheet.transaction.id)
    setSaving(false)
    if (ok) closeSheet()
  }

  const handleVoiceExtracted = (result: VoiceExtraction) => {
    setIsRecorderOpen(false)
    setVoiceExtraction(result)
  }

  const handleVoiceConfirm = async (draft: TransactionDraft): Promise<boolean> => {
    if (!voiceExtraction) return false
    // TransactionConfirmation owns the saving/success/error UI and closes
    // itself (via onCancel) after showing a brief success state.
    return create(draft, {
      source: 'VOICE',
      rawTranscript: voiceExtraction.rawTranscript,
      language: voiceExtraction.language,
      confidence: voiceExtraction.confidence,
    })
  }

  return (
    <div className="flex flex-1 flex-col">
      <BalanceCard balance={balance} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-muted">{t('today.label')}</h2>
          <button
            type="button"
            onClick={() => setSheet({ mode: 'create' })}
            className="text-sm font-medium text-text underline underline-offset-2"
          >
            {t('miamala.addManually')}
          </button>
        </div>

        {state === 'loading' && <LoadingIndicator message={t('miamala.loading')} />}

        {state === 'error' && <ErrorState onRetry={refresh} />}

        {state === 'ready' && transactions.length === 0 && (
          <EmptyState message={t('miamala.empty')} hint={t('mic.idleHint')} />
        )}

        {state === 'ready' && transactions.length > 0 && (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => setSheet({ mode: 'edit', transaction })}
                className="block w-full text-left"
              >
                <TransactionCard transaction={transaction} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center py-6">
        <VoiceButton state="idle" onPress={() => setIsRecorderOpen(true)} />
      </div>

      {sheet && (
        <TransactionSheet
          mode={sheet.mode}
          initial={sheet.mode === 'edit' ? sheet.transaction : BLANK_DRAFT}
          saving={saving}
          onSave={handleSave}
          onDelete={sheet.mode === 'edit' ? handleDelete : undefined}
          onClose={closeSheet}
        />
      )}

      {isRecorderOpen && (
        <VoiceRecorderSheet
          onClose={() => setIsRecorderOpen(false)}
          onExtracted={handleVoiceExtracted}
        />
      )}

      {voiceExtraction && (
        <TransactionConfirmation
          draft={voiceExtraction.draft}
          onConfirm={handleVoiceConfirm}
          onCancel={() => setVoiceExtraction(null)}
        />
      )}
    </div>
  )
}
