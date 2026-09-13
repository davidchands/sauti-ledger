import { useEffect, useRef, useState } from 'react'
import { Trash2, Package, X } from 'lucide-react'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'
import { useCurrency } from '@/currency/useCurrency'
import { useLanguage } from '@/i18n/useLanguage'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/transaction'

const CATEGORIES: TransactionCategory[] = ['Sales', 'Inventory', 'Rent', 'Operational', 'Other']

interface TransactionDetailProps {
  transaction: Transaction
  onChange: (patch: Partial<Transaction>) => void
  onDelete: () => void
  onClose: () => void
}

/**
 * Replaces the fill-in-a-form-then-tap-Save pattern entirely. Every
 * field here is independently, instantly editable — tap it, change it,
 * it's saved. There is no Save button anywhere in this component.
 */
export function TransactionDetail({ transaction, onChange, onDelete, onClose }: TransactionDetailProps) {
  const { t } = useLanguage()
  const { currency } = useCurrency()
  const isIncome = transaction.type === 'INCOME'
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('transactionSheet.editTitle')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="w-full max-w-[430px] rounded-t-3xl bg-surface px-6 pt-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] sm:rounded-3xl sm:pb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['INCOME', 'EXPENSE'] as TransactionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ type })}
                aria-pressed={transaction.type === type}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  transaction.type === type
                    ? type === 'INCOME'
                      ? 'border-income bg-income-bg text-income'
                      : 'border-expense bg-expense-bg text-expense'
                    : 'border-border text-text-muted'
                }`}
              >
                {type === 'INCOME' ? t('confirmation.typeIncome') : t('confirmation.typeExpense')}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('confirmation.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <EditableAmount
          amount={transaction.amount}
          isIncome={isIncome}
          currency={currency}
          onChange={(amount) => onChange({ amount })}
        />

        <EditableQuantity
          quantity={transaction.quantity ?? null}
          unit={transaction.unit ?? null}
          onChange={(quantity, unit) => onChange({ quantity, unit })}
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onChange({ category })}
              aria-pressed={transaction.category === category}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                transaction.category === category
                  ? 'border-text bg-text text-bg'
                  : 'border-border text-text-muted'
              }`}
            >
              {t(`category.${category}`)}
            </button>
          ))}
        </div>

        <EditableText
          value={transaction.description}
          placeholder={t('confirmation.descriptionLabel')}
          onChange={(description) => onChange({ description })}
        />

        <div className="mt-6 border-t border-border pt-4">
          {confirmingDelete ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-muted">{t('transactionSheet.deleteConfirm')}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted"
                >
                  {t('transactionSheet.deleteConfirmNo')}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-full bg-expense px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t('transactionSheet.deleteConfirmYes')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-expense"
            >
              <Trash2 size={15} aria-hidden="true" />
              {t('transactionSheet.delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EditableAmount({
  amount,
  isIncome,
  currency,
  onChange,
}: {
  amount: number
  isIncome: boolean
  currency: CurrencyCode
  onChange: (amount: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(amount))
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    const parsed = Number(draft)
    if (Number.isFinite(parsed) && parsed > 0) onChange(Math.round(parsed))
    setEditing(false)
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') {
            setDraft(String(amount))
            setEditing(false)
          }
        }}
        className={`mt-2 w-full rounded-xl border border-border bg-bg px-3 py-2 text-4xl font-semibold tabular-nums ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(String(amount))
        setEditing(true)
      }}
      className={`mt-2 block text-4xl font-semibold tabular-nums ${isIncome ? 'text-income' : 'text-expense'}`}
    >
      {isIncome ? '+' : '−'} {formatCurrency(amount, currency)}
    </button>
  )
}

function EditableText({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    onChange(draft.trim())
    setEditing(false)
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-base text-text"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
      className="mt-1 block text-base text-text-muted"
    >
      {value || placeholder}
    </button>
  )
}

function EditableQuantity({
  quantity,
  unit,
  onChange,
}: {
  quantity: number | null
  unit: string | null
  onChange: (quantity: number | null, unit: string | null) => void
}) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [quantityDraft, setQuantityDraft] = useState(quantity != null ? String(quantity) : '')
  const [unitDraft, setUnitDraft] = useState(unit ?? '')
  const quantityInputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    const parsedQuantity = Number(quantityDraft)
    if (quantityDraft.trim() && Number.isFinite(parsedQuantity) && parsedQuantity > 0 && unitDraft.trim()) {
      onChange(Math.round(parsedQuantity), unitDraft.trim())
    } else {
      onChange(null, null)
    }
    setEditing(false)
  }

  useEffect(() => {
    if (editing) quantityInputRef.current?.focus()
  }, [editing])

  if (editing) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={quantityInputRef}
          type="number"
          inputMode="numeric"
          min={0}
          value={quantityDraft}
          onChange={(event) => setQuantityDraft(event.target.value)}
          placeholder={t('confirmation.quantityLabel')}
          className="w-20 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-text"
        />
        <input
          type="text"
          value={unitDraft}
          onChange={(event) => setUnitDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
            if (event.key === 'Escape') setEditing(false)
          }}
          placeholder={t('confirmation.unitLabel')}
          className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-text"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setQuantityDraft(quantity != null ? String(quantity) : '')
        setUnitDraft(unit ?? '')
        setEditing(true)
      }}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-muted"
    >
      <Package size={12} aria-hidden="true" />
      {quantity != null && unit ? `${quantity} ${unit}` : t('confirmation.quantityLabel')}
    </button>
  )
}
