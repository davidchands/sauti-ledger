import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import type { DailySummary } from '@/lib/dailySummary'

interface DailySummaryCardProps {
  summary: DailySummary
}

/**
 * Shown after a day's list of recordings — answers the three questions
 * a merchant actually has at the end of a day: what came in, what went
 * out, and what am I left with (DESIGN.md § 18's "Nina kiasi gani?").
 * Closing balance is the running total through this day, not just its
 * net, so a past day reads as "this is what I had then."
 */
export function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const { t } = useLanguage()
  const isPositive = summary.closingBalance >= 0

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <TrendingUp size={13} className="text-income" aria-hidden="true" />
            {t('ripoti.income')}
          </span>
          <p className="text-lg font-semibold tabular-nums text-income">
            + {formatTSh(summary.income)}
          </p>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <TrendingDown size={13} className="text-expense" aria-hidden="true" />
            {t('ripoti.expense')}
          </span>
          <p className="text-lg font-semibold tabular-nums text-expense">
            − {formatTSh(summary.expense)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-bg px-4 py-3.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
          <Wallet size={14} aria-hidden="true" />
          {t('daySummary.closingBalance')}
        </span>
        <p className={`text-xl font-bold tabular-nums ${isPositive ? 'text-text' : 'text-expense'}`}>
          {formatTSh(summary.closingBalance)}
        </p>
      </div>
    </div>
  )
}
