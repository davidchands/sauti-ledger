import { useLanguage } from '@/i18n/useLanguage'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/transaction'

export type TransactionDraft = Pick<
  Transaction,
  'type' | 'amount' | 'category' | 'description'
>

const CATEGORIES: TransactionCategory[] = [
  'Sales',
  'Inventory',
  'Rent',
  'Operational',
  'Other',
]

interface TransactionFieldsProps {
  value: TransactionDraft
  onChange: (value: TransactionDraft) => void
}

/**
 * Shared editable fields (type, amount, category, description) used by
 * both the voice confirmation card (Phase 8) and manual add/edit (Phase 4).
 */
export function TransactionFields({ value, onChange }: TransactionFieldsProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['INCOME', 'EXPENSE'] as TransactionType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...value, type })}
            aria-pressed={value.type === type}
            className={`flex-1 rounded-xl border py-2 text-sm font-medium ${
              value.type === type
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
          value={value.amount}
          onChange={(event) =>
            onChange({ ...value, amount: Number(event.target.value) || 0 })
          }
          className="rounded-xl border border-border px-3 py-2 text-lg font-semibold text-text"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">
          {t('confirmation.categoryLabel')}
        </span>
        <select
          value={value.category}
          onChange={(event) =>
            onChange({ ...value, category: event.target.value as TransactionCategory })
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
          value={value.description}
          onChange={(event) => onChange({ ...value, description: event.target.value })}
          className="rounded-xl border border-border px-3 py-2 text-sm text-text"
        />
      </label>
    </div>
  )
}
