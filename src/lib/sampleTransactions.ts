import type { Transaction } from '@/types/transaction'

/**
 * Design-system preview data only — replaced by real Neon-backed data in
 * Phase 4 (transactions) and Phase 10 (reports). Never persisted, never
 * touches a network or storage layer. Rates are arbitrary placeholders —
 * this data is always shown in its own TZS currency, never converted.
 */
export function buildSampleTransactions(): Transaction[] {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const rates = { rateUsdToTzs: 2500, rateEurToTzs: 2700 }

  return [
    {
      id: 'sample-1',
      type: 'INCOME',
      amount: 25000,
      currency: 'TZS',
      ...rates,
      category: 'Sales',
      description: 'Mchele',
      quantity: 5,
      unit: 'magunia',
      createdAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: 'sample-2',
      type: 'EXPENSE',
      amount: 10000,
      currency: 'TZS',
      ...rates,
      category: 'Operational',
      description: 'Mafuta',
      createdAt: new Date(now - 5 * hour).toISOString(),
    },
    {
      id: 'sample-3',
      type: 'EXPENSE',
      amount: 60000,
      currency: 'TZS',
      ...rates,
      category: 'Inventory',
      description: 'Stock',
      createdAt: new Date(now - 26 * hour).toISOString(),
    },
  ]
}
