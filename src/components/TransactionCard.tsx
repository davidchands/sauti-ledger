import { formatTSh } from '@/lib/currency'
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
  const isIncome = transaction.type === 'INCOME'
  const quantityLabel =
    transaction.quantity && transaction.unit ? `${transaction.quantity} ${transaction.unit}` : null

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p
          className={`text-base font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}
        >
          {isIncome ? '+' : '−'} {formatTSh(transaction.amount)}
        </p>
        <p className="text-sm text-text-muted">
          {t(`category.${transaction.category}`)}
          {quantityLabel ? ` · ${quantityLabel}` : ''}
          {transaction.description ? ` · ${transaction.description}` : ''}
        </p>
      </div>
      <p className="text-xs text-text-muted">{formatTime(transaction.createdAt, language)}</p>
    </div>
  )
}
