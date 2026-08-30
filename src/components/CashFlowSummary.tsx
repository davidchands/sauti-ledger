import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'

interface CashFlowSummaryProps {
  income: number
  expense: number
}

export function CashFlowSummary({ income, expense }: CashFlowSummaryProps) {
  const { t } = useLanguage()

  return (
    <div className="flex gap-3">
      <div className="flex-1 rounded-2xl bg-surface p-4">
        <p className="text-xl font-semibold text-income">{formatTSh(income)}</p>
        <p className="text-sm text-text-muted">{t('ripoti.income')}</p>
      </div>
      <div className="flex-1 rounded-2xl bg-surface p-4">
        <p className="text-xl font-semibold text-expense">{formatTSh(expense)}</p>
        <p className="text-sm text-text-muted">{t('ripoti.expense')}</p>
      </div>
    </div>
  )
}
