import { useState } from 'react'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionCard } from '@/components/TransactionCard'
import { VoiceButton } from '@/components/VoiceButton'
import { VoiceStatusPanel } from '@/components/VoiceStatusPanel'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { TransactionSheet } from '@/components/TransactionSheet'
import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactionsContext } from '@/hooks/useTransactionsContext'
import { useVoiceCapture, type VoiceExtraction } from '@/hooks/useVoiceCapture'
import { useSpaceToRecord } from '@/hooks/useSpaceToRecord'
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
  const { transactions, balance, state, refresh, create, update, remove } =
    useTransactionsContext()
  const [sheet, setSheet] = useState<
    { mode: 'create' } | { mode: 'edit'; transaction: Transaction } | null
  >(null)
  const [saving, setSaving] = useState(false)
  const [voiceExtraction, setVoiceExtraction] = useState<VoiceExtraction | null>(null)

  const handleVoiceExtracted = (result: VoiceExtraction) => setVoiceExtraction(result)

  const voice = useVoiceCapture(handleVoiceExtracted)
  useSpaceToRecord(voice.start, voice.stop, voice.cancel, !voiceExtraction && !sheet)

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

      <div className="flex flex-col items-center gap-3 py-6">
        <VoiceStatusPanel
          uiState={voice.uiState}
          recorderError={voice.recorderError}
          onDismiss={voice.retryFromRecording}
        />

        <VoiceButton
          uiState={voice.uiState}
          levels={voice.levels}
          durationMs={voice.durationMs}
          onPressStart={voice.start}
          onPressEnd={voice.stop}
        />

        <p className="hidden text-xs text-text-muted md:block">{t('recorder.spaceHint')}</p>
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
