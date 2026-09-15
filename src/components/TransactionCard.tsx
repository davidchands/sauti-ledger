import { Package } from 'lucide-react'
import { formatCurrency, convertTransactionAmount } from '@/lib/currency'
import { useCurrency } from '@/currency/useCurrency'
import { useLanguage } from '@/i18n/useLanguage'
import type { Transaction } from '@/types/transaction'

function formatTime(iso: string, language: 'sw' | 'en'): string {
  return new Date(iso).toLocaleTimeString(language === 'sw' ? 'sw-TZ' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { t, language } = useLanguage()
  const { currency } = useCurrency()
  const isIncome = transaction.type === 'INCOME'
  const hasQuantity = transaction.quantity != null && transaction.unit

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-base font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? '+' : '−'}{' '}
            {formatCurrency(convertTransactionAmount(transaction, currency), currency)}
          </p>
          {hasQuantity && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs font-semibold tabular-nums text-text-muted">
              <Package size={11} aria-hidden="true" />
              {transaction.quantity} {transaction.unit}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-text-muted">
          {t(`category.${transaction.category}`)}
          {transaction.description ? ` · ${transaction.description}` : ''}
        </p>
      </div>
      <p className="shrink-0 pl-3 text-xs text-text-muted">
        {formatTime(transaction.createdAt, language)}
      </p>
    </div>
  )
}
