import { apiClient } from '@/lib/apiClient'
import type { ExtractedTransaction } from '@/types/extraction'

export async function extractTransactions(transcript: string): Promise<ExtractedTransaction[]> {
  const result = await apiClient.post<{ transactions: ExtractedTransaction[] }>('/extract', {
    transcript,
  })
  return result.transactions
}
