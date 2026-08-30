import { useState } from 'react'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/transaction'

type DraftTransaction = Pick<Transaction, 'type' | 'amount' | 'category' | 'description'>

const CATEGORIES: TransactionCategory[] = [
  'Sales',
  'Inventory',
  'Rent',
  'Operational',
  'Other',
]

interface TransactionConfirmationProps {
  draft: DraftTransaction
  onConfirm: (draft: DraftTransaction) => void
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
            <div className="flex gap-2">
              {(['INCOME', 'EXPENSE'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEditable((prev) => ({ ...prev, type }))}
                  aria-pressed={editable.type === type}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium ${
                    editable.type === type
                      ? type === 'INCOME'
                        ? 'border-income bg-income-bg text-income'
                        : 'border-expense bg-expense-bg text-expense'
                      : 'border-border text-text-muted'
                  }`}
                >
                  {type === 'INCOME' ? '+' : '−'}{' '}
                  {t(type === 'INCOME' ? 'confirmation.typeIncome' : 'confirmation.typeExpense')}
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-muted">
                {t('confirmation.amountLabel')}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={editable.amount}
                onChange={(event) =>
                  setEditable((prev) => ({ ...prev, amount: Number(event.target.value) || 0 }))
                }
                className="rounded-xl border border-border px-3 py-2 text-lg font-semibold text-text"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-muted">
                {t('confirmation.categoryLabel')}
              </span>
              <select
                value={editable.category}
                onChange={(event) =>
                  setEditable((prev) => ({
                    ...prev,
                    category: event.target.value as TransactionCategory,
                  }))
                }
                className="rounded-xl border border-border px-3 py-2 text-sm text-text"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`category.${category}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-muted">
                {t('confirmation.descriptionLabel')}
              </span>
              <input
                type="text"
                value={editable.description}
                onChange={(event) =>
                  setEditable((prev) => ({ ...prev, description: event.target.value }))
                }
                className="rounded-xl border border-border px-3 py-2 text-sm text-text"
              />
            </label>

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
