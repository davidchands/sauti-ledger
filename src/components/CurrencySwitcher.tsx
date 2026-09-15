import { useCurrency } from '@/currency/useCurrency'
import { useLanguage } from '@/i18n/useLanguage'
import { CURRENCIES, isCurrencyCode } from '@/lib/currency'

/**
 * A native select, not a custom dropdown — three options is a short
 * enough list that the platform picker is the simplest, most
 * accessible choice, matching LanguageSwitcher's minimal pill style.
 */
export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  const { t } = useLanguage()

  return (
    <select
      value={currency}
      onChange={(event) => {
        if (isCurrencyCode(event.target.value)) setCurrency(event.target.value)
      }}
      aria-label={t('currency.label')}
      className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-text-muted"
    >
      {CURRENCIES.map((option) => (
        <option key={option.code} value={option.code}>
          {option.code} ({option.symbol})
        </option>
      ))}
    </select>
  )
}
