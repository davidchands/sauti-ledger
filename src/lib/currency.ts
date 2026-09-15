export type CurrencyCode = 'TZS' | 'USD' | 'EUR'

export interface CurrencyOption {
  code: CurrencyCode
  /** Shown as the amount prefix, e.g. "TSh 20,000" — matches the app's existing symbol-then-number style, not a locale-specific placement. */
  symbol: string
  name: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
]

export const DEFAULT_CURRENCY: CurrencyCode = 'TZS'

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value)
}

/**
 * Grouping always uses en-US comma separators regardless of currency, so
 * the number itself reads the same no matter which symbol is picked.
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency
  return `${symbol} ${Math.round(amount).toLocaleString('en-US')}`
}

/**
 * For the landing page's product demos only — those illustrate the app
 * for Tanzanian merchants specifically and have no CurrencyProvider, so
 * they always show TSh regardless of what a signed-in user has picked.
 */
export function formatTSh(amount: number): string {
  return formatCurrency(amount, 'TZS')
}

/**
 * The exchange-rate snapshot every transaction carries, frozen at the
 * moment it was recorded (fetched live, server-side — server/lib/
 * exchangeRates.ts) and never updated afterward: the user explicitly
 * wants a transaction's converted value to stay put, not drift as
 * today's rates change. "rate" = how many TZS equal 1 unit of that
 * currency at recording time.
 */
export interface RateSnapshot {
  rateUsdToTzs: number
  rateEurToTzs: number
}

function toTzs(amount: number, currency: CurrencyCode, rates: RateSnapshot): number {
  if (currency === 'TZS') return amount
  if (currency === 'USD') return amount * rates.rateUsdToTzs
  return amount * rates.rateEurToTzs
}

function fromTzs(amountTzs: number, currency: CurrencyCode, rates: RateSnapshot): number {
  if (currency === 'TZS') return amountTzs
  if (currency === 'USD') return amountTzs / rates.rateUsdToTzs
  return amountTzs / rates.rateEurToTzs
}

/**
 * Converts an amount from one currency to another using a SPECIFIC
 * transaction's frozen rate snapshot — never today's live rate, so a
 * transaction's converted value never changes on a later viewing no
 * matter when it's looked at (the whole point of freezing rates at
 * recording time rather than converting live).
 */
export function convertAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: RateSnapshot,
): number {
  if (fromCurrency === toCurrency) return amount
  return fromTzs(toTzs(amount, fromCurrency, rates), toCurrency, rates)
}

/** A minimal structural shape (not the full `Transaction` type, to avoid a circular import) covering what conversion needs off any transaction-like record. */
interface ConvertibleTransaction extends RateSnapshot {
  type: 'INCOME' | 'EXPENSE'
  amount: number
  currency: CurrencyCode
}

/** Converts one transaction's amount into `toCurrency` using its own frozen rate snapshot. */
export function convertTransactionAmount(
  transaction: ConvertibleTransaction,
  toCurrency: CurrencyCode,
): number {
  return convertAmount(transaction.amount, transaction.currency, toCurrency, transaction)
}

/**
 * The running balance across a set of transactions, each converted into
 * `currency` via its OWN frozen rate snapshot before summing — never a
 * single blanket rate, since different transactions can carry different
 * snapshots from different days.
 */
export function computeBalance(
  transactions: ConvertibleTransaction[],
  currency: CurrencyCode,
): number {
  return transactions.reduce((sum, t) => {
    const converted = convertTransactionAmount(t, currency)
    return sum + (t.type === 'INCOME' ? converted : -converted)
  }, 0)
}
