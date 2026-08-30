import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'

interface BalanceCardProps {
  balance: number
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const { t } = useLanguage()

  return (
    <div className="px-5 pt-6 pb-4 text-center">
      <p className="text-sm text-text-muted">{t('balance.label')}</p>
      <p className="mt-1 text-5xl font-semibold tracking-tight text-text">
        {formatTSh(balance)}
      </p>
    </div>
  )
}
