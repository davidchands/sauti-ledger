import { motion, useReducedMotion, useInView } from 'motion/react'
import { useRef } from 'react'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import { REPORTS_DEMO_DATA } from '@/components/landing/reportsDemoData'

const { weeklyIncome: WEEKLY_INCOME, weeklyExpense: WEEKLY_EXPENSE, leakCategory: LEAK_CATEGORY, leakAmount: LEAK_AMOUNT } =
  REPORTS_DEMO_DATA
const MAX_BAR = Math.max(WEEKLY_INCOME, WEEKLY_EXPENSE)

/**
 * A second phone state — DESIGN.md's four report questions (§ 18)
 * answered live, using the same ripoti.* / category.* translation keys
 * as the real Ripoti screen. Bars animate in once when scrolled into
 * view, not on a timer — this section is read, not watched.
 */
export function PhoneReportsDemo() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <div ref={ref} className="flex h-full flex-col bg-bg px-5 pt-11 pb-6">
      <p className="text-center text-[11px] font-medium text-text-muted">{t('balance.label')}</p>
      <p className="mt-0.5 text-center text-2xl font-bold tabular-nums text-text">
        {formatTSh(REPORTS_DEMO_DATA.balance)}
      </p>

      <p className="mt-6 text-xs font-semibold text-text-muted">{t('ripoti.thisWeek')}</p>

      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[11px] font-medium text-text-muted">{t('ripoti.income')}</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-income">
            {formatTSh(WEEKLY_INCOME)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-[11px] font-medium text-text-muted">{t('ripoti.expense')}</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-expense">
            {formatTSh(WEEKLY_EXPENSE)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1 rounded-xl border border-border bg-surface p-3.5">
        <p className="text-[11px] font-semibold text-text">{t('ripoti.biggestLeak')}</p>
        <div className="mt-3 flex h-24 items-end gap-3">
          <Bar
            label={t('ripoti.income')}
            value={WEEKLY_INCOME}
            colorClass="bg-income"
            inView={inView}
            reduceMotion={!!reduceMotion}
          />
          <Bar
            label={t('ripoti.expense')}
            value={WEEKLY_EXPENSE}
            colorClass="bg-expense"
            inView={inView}
            reduceMotion={!!reduceMotion}
          />
        </div>
        <p className="mt-3 text-[11px] text-text-muted">
          {t(`category.${LEAK_CATEGORY}`)} ({formatTSh(LEAK_AMOUNT)}) {t('ripoti.leakInsightSuffix')}
        </p>
      </div>
    </div>
  )
}

function Bar({
  label,
  value,
  colorClass,
  inView,
  reduceMotion,
}: {
  label: string
  value: number
  colorClass: string
  inView: boolean
  reduceMotion: boolean
}) {
  const heightPct = Math.max(8, Math.round((value / MAX_BAR) * 100))
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div className="flex h-full w-full items-end">
        <motion.div
          initial={reduceMotion ? false : { height: '4%' }}
          animate={inView ? { height: `${heightPct}%` } : undefined}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`w-full rounded-t-md ${colorClass}`}
          style={reduceMotion ? { height: `${heightPct}%` } : undefined}
        />
      </div>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  )
}
