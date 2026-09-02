import { apiClient } from './apiClient'
import { isNetworkError } from './isNetworkError'
import { localDb, type LocalTransaction } from './localDb'
import type { TransactionCategory, TransactionType } from '@/types/transaction'

export interface ApiTransaction {
  id: string
  type: TransactionType
  amount: number
  category: TransactionCategory
  description: string
  quantity?: number | null
  unit?: string | null
  createdAt: string
}

export function toLocalTransaction(api: ApiTransaction, pending: boolean): LocalTransaction {
  return {
    id: api.id,
    type: api.type,
    amount: api.amount,
    category: api.category,
    description: api.description,
    quantity: api.quantity ?? null,
    unit: api.unit ?? null,
    createdAt: api.createdAt,
    pending,
  }
}

/**
 * Replays queued offline mutations against the real API, in order. Stops
 * on the first network failure (still offline — retry later, on the next
 * 'online' event). A genuine server rejection (ApiError) drops that one
 * outbox entry rather than retrying forever, but the local record stays
 * — surfacing sync conflicts to the user is future work, not silent data
 * loss (AGENTS.md § 9).
 */
export async function syncOutbox(): Promise<{ syncedCount: number }> {
  const entries = await localDb.outbox.orderBy('createdAt').toArray()
  let syncedCount = 0

  for (const entry of entries) {
    try {
      if (entry.op === 'create') {
        const created = await apiClient.post<ApiTransaction>('/transactions', entry.payload)
        await localDb.transactions.delete(entry.localId)
        await localDb.transactions.put(toLocalTransaction(created, false))

        // An offline edit/delete queued after this create still points at
        // the temp id — remap it now that the real id exists.
        const later = await localDb.outbox.where('localId').equals(entry.localId).toArray()
        for (const laterEntry of later) {
          if (laterEntry.id === entry.id) continue
          await localDb.outbox.update(laterEntry.id, { localId: created.id })
        }
      } else if (entry.op === 'update') {
        const updated = await apiClient.patch<ApiTransaction>(
          `/transactions/${entry.localId}`,
          entry.payload,
        )
        await localDb.transactions.put(toLocalTransaction(updated, false))
      } else if (entry.op === 'delete') {
        await apiClient.delete(`/transactions/${entry.localId}`)
        await localDb.transactions.delete(entry.localId)
      }

      await localDb.outbox.delete(entry.id)
      syncedCount++
    } catch (error) {
      if (isNetworkError(error)) break
      await localDb.outbox.delete(entry.id)
    }
  }

  return { syncedCount }
}
