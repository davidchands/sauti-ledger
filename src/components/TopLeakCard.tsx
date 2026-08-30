import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import type { TranslationPath } from '@/i18n/translations'
import type { TransactionCategory } from '@/types/transaction'

interface CategoryLeak {
  category: TransactionCategory
  amount: number
}

interface TopLeakCardProps {
  leaks: CategoryLeak[]
}

export function TopLeakCard({ leaks }: TopLeakCardProps) {
  const { t } = useLanguage()
  const max = leaks[0]?.amount ?? 0

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-text-muted">
        {t('ripoti.biggestLeak')}
      </h2>

      <div className="flex flex-col gap-4">
        {leaks.map(({ category, amount }) => (
          <div key={category}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-text">
                {t(`category.${category}` as TranslationPath)}
              </p>
              <p className="text-sm font-medium text-text">{formatTSh(amount)}</p>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-border">
              <div
                className="h-2 rounded-full bg-expense"
                style={{ width: `${max ? (amount / max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
