const RATE_URL = 'https://open.er-api.com/v6/latest/USD'
const FETCH_TIMEOUT_MS = 3000

/**
 * Emergency fallback only — used if the live rate fetch fails or times
 * out, so saving a transaction is never blocked by an external API
 * being flaky. Rough figures, not kept up to date; a transaction saved
 * under this fallback simply converts less precisely than one saved
 * with a live rate, it's still saved.
 */
const FALLBACK_RATES = { rateUsdToTzs: 2500, rateEurToTzs: 2700 }

export interface RateSnapshot {
  rateUsdToTzs: number
  rateEurToTzs: number
}

/**
 * Server-only, no API key needed (open.er-api.com is a free, keyless
 * exchange-rate API). Called once per transaction creation — the
 * result is frozen onto that transaction forever (README §
 * multi-currency: "the rates of the day, never updated after that"),
 * never re-fetched or averaged, so no caching layer is needed here.
 */
export async function fetchExchangeRates(): Promise<RateSnapshot> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const response = await fetch(RATE_URL, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) return FALLBACK_RATES

    const data = (await response.json()) as { rates?: Record<string, number> }
    const usdToTzs = data.rates?.TZS
    const usdToEur = data.rates?.EUR
    if (!usdToTzs || !usdToEur) return FALLBACK_RATES

    return { rateUsdToTzs: usdToTzs, rateEurToTzs: usdToTzs / usdToEur }
  } catch {
    return FALLBACK_RATES
  }
}
