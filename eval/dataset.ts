import type { TransactionCategory, TransactionType } from '../src/types/transaction'

export interface EvalCase {
  transcript: string
  /** null means the field is expected to be ambiguous (needsClarification: true). */
  expected: {
    type: TransactionType | null
    amount: number | null
    category?: TransactionCategory
  }
}

/**
 * Mirrors AI_SPEC.md § 6. This is the evaluation dataset AI_SPEC.md § 5
 * commits to: run every example through the real pipeline before
 * deploying a prompt or model change, and never regress silently.
 *
 * category is only checked when the case isn't ambiguous — an ambiguous
 * case's category is a best-effort guess, not something to pin down.
 */
export const evalDataset: EvalCase[] = [
  // Swahili
  {
    transcript: 'Leo nimeuza mchele elfu ishirini',
    expected: { type: 'INCOME', amount: 20000, category: 'Sales' },
  },
  {
    transcript: 'Nimenunua stock ya laki mbili',
    expected: { type: 'EXPENSE', amount: 200000, category: 'Inventory' },
  },
  {
    transcript: 'Nimelipa pango laki tatu',
    expected: { type: 'EXPENSE', amount: 300000, category: 'Rent' },
  },
  {
    transcript: 'Mteja amenipa elfu hamsini',
    expected: { type: 'INCOME', amount: 50000, category: 'Sales' },
  },
  {
    transcript: 'Nimempa fundi elfu thelathini',
    expected: { type: 'EXPENSE', amount: 30000, category: 'Operational' },
  },
  {
    transcript: 'Mafuta ya gari elfu kumi na tano',
    expected: { type: 'EXPENSE', amount: 15000, category: 'Operational' },
  },
  {
    transcript: 'Nimeuza bidhaa elfu tano.',
    expected: { type: 'INCOME', amount: 5000, category: 'Sales' },
  },

  // English
  {
    transcript: 'I paid rent 300 thousand',
    expected: { type: 'EXPENSE', amount: 300000, category: 'Rent' },
  },
  {
    transcript: 'I sold rice for twenty thousand',
    expected: { type: 'INCOME', amount: 20000, category: 'Sales' },
  },
  {
    transcript: 'I spent fifty thousand on stock.',
    expected: { type: 'EXPENSE', amount: 50000, category: 'Inventory' },
  },
  {
    transcript: 'Received eighty thousand from a customer',
    expected: { type: 'INCOME', amount: 80000, category: 'Sales' },
  },

  // Mixed Swahili/English (code-switching)
  {
    transcript: 'Leo nimeuza twenty five thousand',
    expected: { type: 'INCOME', amount: 25000, category: 'Sales' },
  },
  {
    transcript: 'Leo nimeuza stock twenty thousand',
    expected: { type: 'INCOME', amount: 20000, category: 'Sales' },
  },
  {
    transcript: 'Leo nimeuza goods za 50k',
    expected: { type: 'INCOME', amount: 50000, category: 'Sales' },
  },

  // Tanzanian shorthand
  {
    transcript: 'nimepata 20k',
    expected: { type: 'INCOME', amount: 20000, category: 'Sales' },
  },
  {
    transcript: 'nimelipa 5k',
    expected: { type: 'EXPENSE', amount: 5000 },
  },
  {
    transcript: 'laki moja',
    expected: { type: null, amount: 100000 },
  },
  {
    transcript: 'milioni mbili',
    expected: { type: null, amount: 2000000 },
  },
  {
    transcript: 'elfu tano',
    expected: { type: null, amount: 5000 },
  },

  // Phrasing variation — should all normalize to the same result
  {
    transcript: 'Leo mauzo yalikuwa 80,000.',
    expected: { type: 'INCOME', amount: 80000, category: 'Sales' },
  },
  {
    transcript: 'Leo nimeingiza 80k.',
    expected: { type: 'INCOME', amount: 80000, category: 'Sales' },
  },
  {
    transcript: 'Nilipata 80,000 kwa mauzo.',
    expected: { type: 'INCOME', amount: 80000, category: 'Sales' },
  },

  // Genuinely ambiguous — must ask for clarification, never guess
  {
    transcript: 'Nimepata mia.',
    expected: { type: 'INCOME', amount: null },
  },
]
