import { apiClient } from '@/lib/apiClient'
import type { ExtractedTransaction } from '@/types/extraction'

export async function extractTransaction(transcript: string): Promise<ExtractedTransaction> {
  return apiClient.post<ExtractedTransaction>('/extract', { transcript })
}
