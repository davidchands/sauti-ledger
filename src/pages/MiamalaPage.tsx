import { useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionCard } from '@/components/TransactionCard'
import { VoiceButton } from '@/components/VoiceButton'
import { VoiceStatusPanel } from '@/components/VoiceStatusPanel'
import { ChatEntryBar } from '@/components/ChatEntryBar'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { TransactionSheet } from '@/components/TransactionSheet'
import { TransactionConfirmation } from '@/components/TransactionConfirmation'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactionsContext } from '@/hooks/useTransactionsContext'
import { useVoiceCapture, type VoiceExtraction } from '@/hooks/useVoiceCapture'
import { useSpaceToRecord } from '@/hooks/useSpaceToRecord'
import { useChatEntry, type ChatExtraction } from '@/hooks/useChatEntry'
import { groupTransactionsByDay, dayGroupLabel } from '@/lib/groupTransactionsByDay'
import type { ExtractionItem } from '@/lib/transactionExtraction'
import type { TransactionDraft } from '@/components/TransactionFields'
import type { Transaction } from '@/types/transaction'

/** Extraction results from voice and chat text entry both flow through the same confirmation queue. */
interface ExtractionQueue {
  items: ExtractionItem[]
  rawTranscript: string
  language?: 'sw' | 'en'
  source: 'VOICE' | 'MANUAL'
}

export function MiamalaPage() {
  const { t, language } = useLanguage()
  const { transactions, balance, state, refresh, create, update, remove } =
    useTransactionsContext()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [saving, setSaving] = useState(false)
  const [extraction, setExtraction] = useState<ExtractionQueue | null>(null)
  const [extractionIndex, setExtractionIndex] = useState(0)
  // Voice is the primary way to record a transaction (DESIGN.md § 13) —
  // typing is a secondary fallback, tucked behind a toggle rather than
  // competing with the mic for visual attention.
  const [showChatEntry, setShowChatEntry] = useState(false)

  const handleVoiceExtracted = (result: VoiceExtraction) => {
    setExtraction({ ...result, source: 'VOICE' })
    setExtractionIndex(0)
  }

  const handleChatExtracted = (result: ChatExtraction) => {
    setExtraction({ ...result, source: 'MANUAL' })
    setExtractionIndex(0)
  }

  const voice = useVoiceCapture(handleVoiceExtracted)
  const chat = useChatEntry(handleChatExtracted)
  useSpaceToRecord(voice.start, voice.stop, voice.cancel, !extraction && !editing)

  const closeEditSheet = () => setEditing(null)

  const handleEditSave = async (draft: TransactionDraft) => {
    if (!editing) return
    setSaving(true)
    const ok = await update(editing.id, draft)
    setSaving(false)
    if (ok) closeEditSheet()
  }

  const handleEditDelete = async () => {
    if (!editing) return
    setSaving(true)
    const ok = await remove(editing.id)
    setSaving(false)
    if (ok) closeEditSheet()
  }

  const handleExtractionConfirm = async (draft: TransactionDraft): Promise<boolean> => {
    if (!extraction) return false
    return create(draft, {
      source: extraction.source,
      rawTranscript: extraction.rawTranscript,
      language: extraction.language,
      confidence: extraction.items[extractionIndex].confidence,
    })
  }

  // A single recording or typed message can produce several transactions
  // (AI_SPEC.md § 3a) — step through them one confirmation at a time
  // rather than saving silently.
  const handleExtractionSaved = () => {
    if (!extraction) return
    if (extractionIndex + 1 < extraction.items.length) {
      setExtractionIndex((index) => index + 1)
    } else {
      setExtraction(null)
    }
  }

  const dayGroups = groupTransactionsByDay(transactions)

  return (
    <div className="flex flex-1 flex-col">
      <BalanceCard balance={balance} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {state === 'loading' && <LoadingIndicator message={t('miamala.loading')} />}

        {state === 'error' && <ErrorState onRetry={refresh} />}

        {state === 'ready' && transactions.length === 0 && (
          <EmptyState message={t('miamala.empty')} hint={t('mic.idleHint')} />
        )}

        {state === 'ready' &&
          dayGroups.map((group) => (
            <div key={group.key} className="mb-1 first:mt-0">
              <h2 className="mt-4 mb-1 text-sm font-medium text-text-muted first:mt-0">
                {dayGroupLabel(group.date, language, {
                  today: t('today.label'),
                  yesterday: t('today.yesterday'),
                })}
              </h2>
              <div className="divide-y divide-border">
                {group.items.map((transaction) => (
                  <button
                    key={transaction.id}
                    type="button"
                    onClick={() => setEditing(transaction)}
                    className="block w-full text-left"
                  >
                    <TransactionCard transaction={transaction} />
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="flex flex-col items-center gap-3 px-5 py-6">
        <VoiceStatusPanel
          uiState={voice.uiState}
          recorderError={voice.recorderError}
          onDismiss={voice.retryFromRecording}
        />

        {showChatEntry && (
          <div className="flex w-full items-center gap-2">
            <div className="flex-1">
              <ChatEntryBar status={chat.status} onSubmit={chat.submit} onDismiss={chat.reset} />
            </div>
            <button
              type="button"
              onClick={() => setShowChatEntry(false)}
              aria-label={t('chatEntry.toggleHide')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-muted"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        <VoiceButton
          uiState={voice.uiState}
          levels={voice.levels}
          durationMs={voice.durationMs}
          onPressStart={voice.start}
          onPressEnd={voice.stop}
        />

        <p className="hidden text-xs text-text-muted md:block">{t('recorder.spaceHint')}</p>

        {!showChatEntry && (
          <button
            type="button"
            onClick={() => setShowChatEntry(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted underline underline-offset-2"
          >
            <Keyboard size={13} aria-hidden="true" />
            {t('chatEntry.toggleShow')}
          </button>
        )}
      </div>

      {editing && (
        <TransactionSheet
          mode="edit"
          initial={editing}
          saving={saving}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          onClose={closeEditSheet}
        />
      )}

      {extraction && (
        <TransactionConfirmation
          key={extractionIndex}
          draft={extraction.items[extractionIndex].draft}
          progress={
            extraction.items.length > 1
              ? { index: extractionIndex, total: extraction.items.length }
              : undefined
          }
          onConfirm={handleExtractionConfirm}
          onSaved={handleExtractionSaved}
          onCancel={() => setExtraction(null)}
        />
      )}
    </div>
  )
}
