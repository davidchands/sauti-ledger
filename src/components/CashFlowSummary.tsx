import { formatCurrency } from '@/lib/currency'
import { useCurrency } from '@/currency/useCurrency'
import { useLanguage } from '@/i18n/useLanguage'

interface CashFlowSummaryProps {
  income: number
  expense: number
}

export function CashFlowSummary({ income, expense }: CashFlowSummaryProps) {
  const { t } = useLanguage()
  const { currency } = useCurrency()

  return (
    <div className="flex gap-3">
      <div className="flex-1 rounded-2xl bg-surface p-4">
        <p className="text-xl font-semibold text-income">{formatCurrency(income, currency)}</p>
        <p className="text-sm text-text-muted">{t('ripoti.income')}</p>
      </div>
      <div className="flex-1 rounded-2xl bg-surface p-4">
        <p className="text-xl font-semibold text-expense">{formatCurrency(expense, currency)}</p>
        <p className="text-sm text-text-muted">{t('ripoti.expense')}</p>
      </div>
    </div>
  )
}
