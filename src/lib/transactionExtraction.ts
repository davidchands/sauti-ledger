import { extractTransactions } from '@/services/extractionService'
import type { TransactionDraft } from '@/components/TransactionFields'

export interface ExtractionItem {
  draft: TransactionDraft
  confidence: number
}

/**
 * Runs a transcript, spoken or typed, through the extraction pipeline
 * and keeps only the items the model could actually pin down. Ambiguous
 * items are dropped rather than blocking everything else in the same
 * transcript (AI_SPEC.md § 3a); never invents a missing amount or type.
 * Shared by voice capture and chat-style manual entry so both go
 * through identical extraction logic.
 */
export async function extractUsableItems(transcript: string): Promise<ExtractionItem[]> {
  const results = await extractTransactions(transcript)
  return results
    .filter(
      (item): item is typeof item & { type: 'INCOME' | 'EXPENSE'; amount: number } =>
        !item.needsClarification && item.type !== null && item.amount !== null,
    )
    .map((item) => ({
      draft: {
        type: item.type,
        amount: item.amount,
        category: item.category,
        description: item.description,
      },
      confidence: item.confidence,
    }))
}
