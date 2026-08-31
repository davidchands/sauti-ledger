import { z } from 'zod'

/**
 * Shared between client and server — safe to import from either (no
 * server-only code). type/amount are nullable: per AI_SPEC.md § 4, the
 * AI must never invent a missing amount or type. needsClarification is
 * computed deterministically from those nulls, never trusted from the
 * model itself (AGENTS.md § 5 — never trust raw AI output).
 */
export const extractedTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).nullable(),
  amount: z.number().int().positive().nullable(),
  category: z.enum(['Sales', 'Inventory', 'Rent', 'Operational', 'Other']),
  description: z.string(),
  confidence: z.number().min(0).max(1),
})

export type GeminiExtraction = z.infer<typeof extractedTransactionSchema>

export interface ExtractedTransaction extends GeminiExtraction {
  needsClarification: boolean
}

/**
 * A recording can describe more than one transaction (AI_SPEC.md § 3a) —
 * Gemini always returns an array, even for the common single-transaction
 * case, so the caller never has to special-case count.
 */
export const geminiResponseSchema = z.object({
  transactions: z.array(extractedTransactionSchema).min(1),
})
