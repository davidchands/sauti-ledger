import type { TransactionCategory, TransactionType } from '../src/types/transaction'

export interface EvalCase {
  transcript: string
  /** null means the field is expected to be ambiguous (needsClarification: true). */
  expected: {
    type: TransactionType | null
    amount: number | null
    category?: TransactionCategory
    /** Only checked when set — most cases don't mention a quantity at all. */
    quantity?: number | null
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

  // Non-shilling currency words — the app's currency selector (README/
  // multi-currency feature) is a display-only label, never a hint to the
  // AI pipeline, so the amount must extract the same regardless of which
  // currency word the speaker uses.
  {
    transcript: 'I sold rice for 100 dollars',
    expected: { type: 'INCOME', amount: 100, category: 'Sales' },
  },
  {
    transcript: 'Bought fuel for 50 dollars',
    expected: { type: 'EXPENSE', amount: 50, category: 'Operational' },
  },
  {
    transcript: 'I sold rice for 20 pounds',
    expected: { type: 'INCOME', amount: 20, category: 'Sales', quantity: null },
  },
  {
    transcript: 'I sold rice for 20 euros',
    expected: { type: 'INCOME', amount: 20, category: 'Sales' },
  },

  // Decimal amounts — most spoken amounts are whole numbers, but cents
  // must be kept when stated explicitly, not rounded away.
  {
    transcript: 'I sold coffee for 2.50 dollars',
    expected: { type: 'INCOME', amount: 2.5, category: 'Sales' },
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

  // Income vs expense — trickier verb pairs a merchant actually uses
  // (paying someone vs being paid, receiving vs giving), not just
  // "sold"/"bought". This is the distinction most likely to trip up a
  // weaker prompt, so it gets its own coverage.
  {
    transcript: 'Nimetumia elfu kumi kwa usafiri',
    expected: { type: 'EXPENSE', amount: 10000, category: 'Operational' },
  },
  {
    transcript: 'Nimepokea elfu thelathini kutoka kwa mteja',
    expected: { type: 'INCOME', amount: 30000, category: 'Sales' },
  },
  {
    transcript: 'Nimemlipa mfanyakazi elfu ishirini',
    expected: { type: 'EXPENSE', amount: 20000, category: 'Operational' },
  },
  {
    transcript: 'Nililipwa elfu hamsini kwa kazi niliyofanya',
    expected: { type: 'INCOME', amount: 50000 },
  },
  {
    transcript: 'I got paid twenty thousand',
    expected: { type: 'INCOME', amount: 20000 },
  },
  {
    transcript: 'I gave the supplier fifteen thousand',
    expected: { type: 'EXPENSE', amount: 15000 },
  },

  // Quantity — only set when the speaker actually states a count
  {
    transcript: 'Niliuza magunia matano ya mchele kwa laki moja',
    expected: { type: 'INCOME', amount: 100000, category: 'Sales', quantity: 5 },
  },
  {
    transcript: 'I bought 10 bottles of cooking oil for fifty thousand',
    expected: { type: 'EXPENSE', amount: 50000, category: 'Inventory', quantity: 10 },
  },
  {
    transcript: 'Nimeuza mchele kwa laki moja',
    expected: { type: 'INCOME', amount: 100000, category: 'Sales', quantity: null },
  },
]
