import { useLanguage } from '@/i18n/useLanguage'

export type TransactionTypeFilterValue = 'ALL' | 'INCOME' | 'EXPENSE'

interface TransactionTypeFilterProps {
  value: TransactionTypeFilterValue
  onChange: (value: TransactionTypeFilterValue) => void
}

const activeClasses: Record<TransactionTypeFilterValue, string> = {
  ALL: 'bg-text text-bg',
  INCOME: 'bg-income text-bg',
  EXPENSE: 'bg-expense text-bg',
}

/** Segmented All/Income/Expense filter for the day's transaction list — the daily summary below stays unfiltered so it keeps reading as the full-day reconciliation. */
export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  const { t } = useLanguage()

  const options: { key: TransactionTypeFilterValue; label: string }[] = [
    { key: 'ALL', label: t('filter.all') },
    { key: 'INCOME', label: t('filter.income') },
    { key: 'EXPENSE', label: t('filter.expense') },
  ]

  return (
    <div role="group" className="mb-3 flex gap-1.5">
      {options.map((option) => {
        const isActive = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? `border-transparent ${activeClasses[option.key]}`
                : 'border-border text-text-muted'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
