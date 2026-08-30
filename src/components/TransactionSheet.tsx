import { useState } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { TransactionFields, type TransactionDraft } from '@/components/TransactionFields'

interface TransactionSheetProps {
  mode: 'create' | 'edit'
  initial: TransactionDraft
  saving?: boolean
  onSave: (draft: TransactionDraft) => void
  onDelete?: () => void
  onClose: () => void
}

/**
 * Manual add/edit for an already-persisted transaction (DESIGN.md § 11 —
 * manual entry is the fallback to voice). Delete requires an explicit
 * second tap, no browser confirm() dialog.
 */
export function TransactionSheet({
  mode,
  initial,
  saving,
  onSave,
  onDelete,
  onClose,
}: TransactionSheetProps) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState(initial)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(mode === 'create' ? 'transactionSheet.addTitle' : 'transactionSheet.editTitle')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="w-full max-w-[430px] rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
        <h2 className="mb-4 text-lg font-semibold text-text">
          {t(mode === 'create' ? 'transactionSheet.addTitle' : 'transactionSheet.editTitle')}
        </h2>

        <TransactionFields value={draft} onChange={setDraft} />

        {confirmingDelete ? (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-center text-sm text-text-muted">
              {t('transactionSheet.deleteConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('transactionSheet.deleteConfirmNo')}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex-1 rounded-xl bg-expense py-3.5 text-base font-semibold text-white"
              >
                {t('transactionSheet.deleteConfirmYes')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
            >
              {t('confirmation.cancel')}
            </button>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex-1 rounded-xl border border-expense py-3.5 text-base font-medium text-expense"
              >
                {t('transactionSheet.delete')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onSave(draft)}
              disabled={saving}
              className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg disabled:opacity-50"
            >
              {saving ? t('transactionSheet.saving') : t('transactionSheet.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
