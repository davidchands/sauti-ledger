import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import type { Transaction } from '@/types/transaction'

function formatTime(iso: string, language: 'sw' | 'en', todayLabel: string): string {
  const date = new Date(iso)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const time = date.toLocaleTimeString(language === 'sw' ? 'sw-TZ' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return isToday ? `${todayLabel}, ${time}` : `${date.toLocaleDateString()}, ${time}`
}

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { t, language } = useLanguage()
  const isIncome = transaction.type === 'INCOME'

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
          {transaction.description ? ` · ${transaction.description}` : ''}
        </p>
      </div>
      <p className="text-xs text-text-muted">
        {formatTime(transaction.createdAt, language, t('today.label'))}
      </p>
    </div>
  )
}
