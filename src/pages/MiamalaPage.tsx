import { useState } from 'react'
import { Keyboard, X, CalendarDays } from 'lucide-react'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionCard } from '@/components/TransactionCard'
import { TransactionToast, type ToastEntry } from '@/components/TransactionToast'
import { VoiceButton } from '@/components/VoiceButton'
import { VoiceStatusPanel } from '@/components/VoiceStatusPanel'
import { ChatEntryBar } from '@/components/ChatEntryBar'
import { EmptyState } from '@/components/EmptyState'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/ErrorState'
import { TransactionDetail } from '@/components/TransactionDetail'
import { TransactionCalendar } from '@/components/TransactionCalendar'
import { DailySummaryCard } from '@/components/DailySummaryCard'
import { LiveCaptionBubble } from '@/components/LiveCaptionBubble'
import { TransactionTypeFilter, type TransactionTypeFilterValue } from '@/components/TransactionTypeFilter'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactionsContext } from '@/hooks/useTransactionsContext'
import { useVoiceCapture, type VoiceExtraction } from '@/hooks/useVoiceCapture'
import { useSpaceToRecord } from '@/hooks/useSpaceToRecord'
import { useChatEntry, type ChatExtraction } from '@/hooks/useChatEntry'
import { dayGroupLabel } from '@/lib/groupTransactionsByDay'
import { computeDailySummary } from '@/lib/dailySummary'
import type { ExtractionItem } from '@/lib/transactionExtraction'
import type { Transaction, TransactionDraft } from '@/types/transaction'

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function MiamalaPage() {
  const { t, language } = useLanguage()
  const { transactions, balance, state, refresh, create, update, remove } =
    useTransactionsContext()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [showCalendar, setShowCalendar] = useState(false)
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  // Voice is the primary way to record a transaction (DESIGN.md § 13) —
  // typing is a secondary fallback, tucked behind a toggle rather than
  // competing with the mic for visual attention.
  const [showChatEntry, setShowChatEntry] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilterValue>('ALL')

  // Saves every extracted item immediately — no confirm-before-save step.
  // The toast (with Undo) is the safety net instead of a blocking modal;
  // the model has proven accurate enough in practice that requiring a tap
  // per transaction was pure friction, not a real safeguard.
  const saveExtractedItems = async (
    items: ExtractionItem[],
    provenance: { source: 'VOICE' | 'MANUAL'; rawTranscript: string; language?: 'sw' | 'en' },
  ) => {
    for (const item of items) {
      const created = await create(item.draft, { ...provenance, confidence: item.confidence })
      if (created) {
        setToasts((current) => [...current, { id: created.id, transaction: created }])
      }
    }
  }

  const handleVoiceExtracted = (result: VoiceExtraction) => {
    saveExtractedItems(result.items, {
      source: 'VOICE',
      rawTranscript: result.rawTranscript,
      language: result.language,
    })
  }

  const handleChatExtracted = (result: ChatExtraction) => {
    saveExtractedItems(result.items, { source: 'MANUAL', rawTranscript: result.rawTranscript })
  }

  const voice = useVoiceCapture(handleVoiceExtracted, language)
  const chat = useChatEntry(handleChatExtracted)
  useSpaceToRecord(voice.start, voice.stop, voice.cancel, !editing && !showCalendar)

  const dismissToast = (id: string) => setToasts((current) => current.filter((e) => e.id !== id))

  const undoToast = (id: string) => {
    dismissToast(id)
    remove(id)
  }

  const editFromToast = (transaction: Transaction) => {
    setToasts((current) => current.filter((e) => e.transaction.id !== transaction.id))
    setEditing(transaction)
  }

  const closeDetail = () => setEditing(null)

  const handleDetailChange = (patch: Partial<Transaction>) => {
    if (!editing) return
    const merged: Transaction = { ...editing, ...patch }
    setEditing(merged)
    const draft: TransactionDraft = {
      type: merged.type,
      amount: merged.amount,
      category: merged.category,
      description: merged.description,
      quantity: merged.quantity,
      unit: merged.unit,
    }
    update(merged.id, draft)
  }

  const handleDetailDelete = async () => {
    if (!editing) return
    await remove(editing.id)
    closeDetail()
  }

  const activeDays = new Set(transactions.map((tx) => dateKey(new Date(tx.createdAt))))
  const dayTransactions = transactions.filter(
    (tx) => dateKey(new Date(tx.createdAt)) === dateKey(selectedDate),
  )
  const visibleTransactions = dayTransactions.filter(
    (tx) => typeFilter === 'ALL' || tx.type === typeFilter,
  )
  const isToday = dateKey(selectedDate) === dateKey(new Date())

  return (
    <div className="flex flex-1 flex-col">
      <BalanceCard balance={balance} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-muted">
            {dayGroupLabel(selectedDate, language, {
              today: t('today.label'),
              yesterday: t('today.yesterday'),
            })}
          </h2>
          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(startOfDay(new Date()))}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-muted"
              >
                {t('calendar.jumpToday')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              aria-label={t('calendar.title')}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-muted"
            >
              <CalendarDays size={13} aria-hidden="true" />
              {t('calendar.title')}
            </button>
          </div>
        </div>

        {state === 'loading' && <LoadingIndicator message={t('miamala.loading')} />}

        {state === 'error' && <ErrorState onRetry={refresh} />}

        {state === 'ready' && dayTransactions.length > 0 && (
          <TransactionTypeFilter value={typeFilter} onChange={setTypeFilter} />
        )}

        {state === 'ready' && dayTransactions.length === 0 && (
          <EmptyState
            message={t('miamala.empty')}
            hint={isToday ? t('mic.idleHint') : undefined}
          />
        )}

        {state === 'ready' && dayTransactions.length > 0 && visibleTransactions.length === 0 && (
          <EmptyState message={t('filter.empty')} />
        )}

        {state === 'ready' && visibleTransactions.length > 0 && (
          <div className="divide-y divide-border">
            {visibleTransactions.map((transaction) => (
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
        )}

        {state === 'ready' && dayTransactions.length > 0 && (
          <DailySummaryCard summary={computeDailySummary(transactions, selectedDate)} />
        )}
      </div>

      <div className="flex flex-col items-center gap-3 px-5 py-6">
        <VoiceStatusPanel
          uiState={voice.uiState}
          recorderError={voice.recorderError}
          onDismiss={voice.retryFromRecording}
        />

        {toasts.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {toasts.map((entry) => (
              <TransactionToast
                key={entry.id}
                entry={entry}
                onUndo={undoToast}
                onExpire={dismissToast}
                onEdit={editFromToast}
              />
            ))}
          </div>
        )}

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

        {voice.uiState === 'recording' && voice.isCaptionSupported && (
          <LiveCaptionBubble caption={voice.caption} />
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
        <TransactionDetail
          transaction={editing}
          onChange={handleDetailChange}
          onDelete={handleDetailDelete}
          onClose={closeDetail}
        />
      )}

      {showCalendar && (
        <TransactionCalendar
          activeDays={activeDays}
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(startOfDay(date))
            setShowCalendar(false)
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  )
}
