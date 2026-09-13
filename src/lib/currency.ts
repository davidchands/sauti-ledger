export type CurrencyCode = 'TZS' | 'KES' | 'UGX' | 'USD' | 'EUR' | 'GBP'

export interface CurrencyOption {
  code: CurrencyCode
  /** Shown as the amount prefix, e.g. "TSh 20,000" — matches the app's existing symbol-then-number style, not a locale-specific placement. */
  symbol: string
  name: string
}

/** East African shillings first (this app's home market), then major internationals. */
export const CURRENCIES: CurrencyOption[] = [
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
]

export const DEFAULT_CURRENCY: CurrencyCode = 'TZS'

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value)
}

/**
 * A pure display/formatting choice (DESIGN.md doesn't distinguish
 * currencies in stored data) — amounts stay plain numbers everywhere
 * else, including the AI extraction pipeline and the database. Grouping
 * always uses en-US comma separators regardless of currency, so the
 * number itself reads the same no matter which symbol is picked.
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
