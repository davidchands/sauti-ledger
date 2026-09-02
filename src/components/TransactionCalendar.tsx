import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'

interface TransactionCalendarProps {
  /** Calendar days (local midnight) that have at least one transaction — shown as a small dot. */
  activeDays: Set<string>
  selected: Date
  onSelect: (date: Date) => void
  onClose: () => void
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/**
 * A real month-grid picker, not a native <input type="date"> — lets a
 * merchant see at a glance which days had activity (the dots) before
 * jumping to one, instead of guessing a date blind.
 */
export function TransactionCalendar({
  activeDays,
  selected,
  onSelect,
  onClose,
}: TransactionCalendarProps) {
  const { t, language } = useLanguage()
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const today = startOfDay(new Date())

  const locale = language === 'sw' ? 'sw-TZ' : 'en-GB'
  const monthLabel = cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  const weekdayLabels = useMemo(() => {
    // Monday-first, matching how Tanzanian calendars are typically read.
    const base = new Date(2024, 0, 1) // a Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d.toLocaleDateString(locale, { weekday: 'narrow' })
    })
  }, [locale])

  const days = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const startOffset = (firstOfMonth.getDay() + 6) % 7 // Monday = 0
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()

    const cells: (Date | null)[] = Array(startOffset).fill(null)
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day))
    }
    return cells
  }, [cursor])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('calendar.title')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="w-full max-w-[380px] rounded-t-3xl bg-surface px-5 pt-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] sm:rounded-3xl sm:pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label={t('calendar.prevMonth')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <p className="text-sm font-semibold text-text capitalize">{monthLabel}</p>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label={t('calendar.nextMonth')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('confirmation.cancel')}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-text-muted"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
          {weekdayLabels.map((label, index) => (
            <p key={index} className="text-xs font-medium text-text-muted">
              {label}
            </p>
          ))}

          {days.map((date, index) => {
            if (!date) return <div key={index} />
            const isToday = isSameDay(date, today)
            const isSelected = isSameDay(date, selected)
            const hasActivity = activeDays.has(dateKey(date))

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(date)}
                className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                  isSelected
                    ? 'bg-text font-semibold text-bg'
                    : isToday
                      ? 'font-semibold text-text'
                      : 'text-text'
                }`}
              >
                {date.getDate()}
                {hasActivity && !isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-income" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        {!isSameDay(selected, today) && (
          <button
            type="button"
            onClick={() => onSelect(today)}
            className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-text"
          >
            {t('calendar.jumpToday')}
          </button>
        )}
      </div>
    </div>
  )
}
