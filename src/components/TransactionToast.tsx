import { useEffect, useState } from 'react'
import { Check, Package } from 'lucide-react'
import { formatCurrency, convertTransactionAmount } from '@/lib/currency'
import { useCurrency } from '@/currency/useCurrency'
import { useLanguage } from '@/i18n/useLanguage'
import type { Transaction } from '@/types/transaction'

const AUTO_DISMISS_MS = 5000

export interface ToastEntry {
  id: string
  transaction: Transaction
}

interface TransactionToastProps {
  entry: ToastEntry
  onUndo: (id: string) => void
  onExpire: (id: string) => void
  onEdit: (transaction: Transaction) => void
}

/**
 * Replaces the confirm-before-save step: a recording or typed message is
 * saved the instant it's understood, no tap required. This is the safety
 * net instead — a brief, dismissible receipt with an Undo, the same
 * pattern as "email sent · undo" rather than a blocking modal.
 */
export function TransactionToast({ entry, onUndo, onExpire, onEdit }: TransactionToastProps) {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const { transaction } = entry
  const isIncome = transaction.type === 'INCOME'
  const hasQuantity = transaction.quantity != null && transaction.unit
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const closeTimer = setTimeout(() => setClosing(true), AUTO_DISMISS_MS - 200)
    const removeTimer = setTimeout(() => onExpire(entry.id), AUTO_DISMISS_MS)
    return () => {
      clearTimeout(closeTimer)
      clearTimeout(removeTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg transition-all duration-200 ${
        closing ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-income-bg text-income">
        <Check size={16} strokeWidth={2.5} aria-hidden="true" />
      </span>

      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? '+' : '−'}{' '}
            {formatCurrency(convertTransactionAmount(transaction, currency), currency)}
          </p>
          {hasQuantity && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-1 py-0.5 text-[11px] font-medium text-text-muted">
              <Package size={10} aria-hidden="true" />
              {transaction.quantity} {transaction.unit}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-text-muted">
          {t(`category.${transaction.category}`)}
          {transaction.description ? ` · ${transaction.description}` : ''}
        </p>
      </button>

      <button
        type="button"
        onClick={() => onUndo(entry.id)}
        className="shrink-0 text-xs font-semibold text-text underline underline-offset-2"
      >
        {t('toast.undo')}
      </button>
    </div>
  )
}
