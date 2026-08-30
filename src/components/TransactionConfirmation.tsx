import { useState } from 'react'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import { TransactionFields, type TransactionDraft } from '@/components/TransactionFields'

interface TransactionConfirmationProps {
  draft: TransactionDraft
  onConfirm: (draft: TransactionDraft) => void
  onCancel: () => void
}

/**
 * The Speak → Understanding → Preview → Confirm/Edit → Saved flow
 * (DESIGN.md § 14-15). Never auto-saves — the user always sees this first.
 */
export function TransactionConfirmation({
  draft,
  onConfirm,
  onCancel,
}: TransactionConfirmationProps) {
  const { t } = useLanguage()
  const [editable, setEditable] = useState(draft)
  const [isEditing, setIsEditing] = useState(false)
  const isIncome = editable.type === 'INCOME'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('confirmation.title')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="w-full max-w-[430px] rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
        {isEditing ? (
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

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('confirmation.cancel')}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text"
              >
                {t('confirmation.edit')}
              </button>
              <button
                type="button"
                onClick={() => onConfirm(editable)}
                className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg"
              >
                {t('confirmation.confirm')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
