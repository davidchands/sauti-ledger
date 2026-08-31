import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import { TransactionFields, type TransactionDraft } from '@/components/TransactionFields'

const SUCCESS_DISPLAY_MS = 900

interface TransactionConfirmationProps {
  draft: TransactionDraft
  /** Resolves to whether the save succeeded — the component owns the saving/success/error UI. */
  onConfirm: (draft: TransactionDraft) => Promise<boolean>
  onCancel: () => void
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

/**
 * The Speak → Understanding → Preview → Confirm/Edit → Saved flow
 * (DESIGN.md § 14-15). Never auto-saves — the user always sees this first,
 * and Confirm is disabled mid-save to prevent a double submit.
 */
export function TransactionConfirmation({
  draft,
  onConfirm,
  onCancel,
}: TransactionConfirmationProps) {
  const { t } = useLanguage()
  const [editable, setEditable] = useState(draft)
  const [isEditing, setIsEditing] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const isIncome = editable.type === 'INCOME'

  const handleConfirm = async () => {
    setSaveState('saving')
    const ok = await onConfirm(editable)
    setSaveState(ok ? 'success' : 'error')
  }

  useEffect(() => {
    if (saveState !== 'success') return
    const timeout = setTimeout(onCancel, SUCCESS_DISPLAY_MS)
    return () => clearTimeout(timeout)
    // onCancel here just unmounts the sheet — the transaction is already saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveState])

  const busy = saveState === 'saving' || saveState === 'success'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('confirmation.title')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="w-full max-w-[430px] rounded-t-3xl bg-surface px-6 pt-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] sm:rounded-3xl sm:pb-6">
        {saveState === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-income-bg text-income">
              <Check size={28} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-text">{t('mic.success')}</p>
          </div>
        ) : isEditing ? (
          <div className="flex flex-col gap-4">
            <TransactionFields value={editable} onChange={setEditable} />

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl bg-text py-3 text-sm font-semibold text-bg"
            >
              {t('confirmation.confirm')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-text-muted">
              {t(`category.${editable.category}`)}
            </p>

            <p
              className={`mt-1 text-4xl font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}
            >
              {isIncome ? '+' : '−'} {formatTSh(editable.amount)}
            </p>

            <p className="mt-1 text-base text-text-muted">{editable.description}</p>

            {saveState === 'error' && (
              <p className="mt-3 text-sm text-warning">{t('error.genericBody')}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted disabled:opacity-50"
              >
                {t('confirmation.cancel')}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={busy}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text disabled:opacity-50"
              >
                {t('confirmation.edit')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg disabled:opacity-50"
              >
                {saveState === 'saving'
                  ? t('transactionSheet.saving')
                  : saveState === 'error'
                    ? t('error.retry')
                    : t('confirmation.confirm')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
