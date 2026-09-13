import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from '@/lib/currency'
import { CurrencyContext } from './currencyContext'

const STORAGE_KEY = 'sautiledger.currency'

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored && isCurrencyCode(stored) ? stored : DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

/**
 * A per-device display preference, same pattern as LanguageProvider —
 * not tied to the signed-in identity, just localStorage. Purely
 * cosmetic: it only changes which symbol formatCurrency prefixes,
 * never how amounts are stored, spoken, or extracted (AGENTS.md § 4-5).
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readStoredCurrency)

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage may be unavailable (private browsing, disabled storage) — non-fatal
    }
  }, [])

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
