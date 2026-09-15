import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import { isNetworkError } from '@/lib/isNetworkError'
import { localDb, type LocalTransaction, type OutboxEntry } from '@/lib/localDb'
import { toLocalTransaction, syncOutbox, type ApiTransaction } from '@/lib/transactionSync'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { CurrencyCode } from '@/lib/currency'
import type { TransactionDraft } from '@/types/transaction'

// Placeholder only, for the brief window an offline-created transaction
// is shown before it syncs — the server always overwrites these with a
// live rate snapshot on sync (server/lib/exchangeRates.ts has the same
// fallback for when ITS live fetch fails, kept in sync with this one).
const OFFLINE_FALLBACK_RATES = { rateUsdToTzs: 2500, rateEurToTzs: 2700 }

/** Provenance for a transaction that came from AI extraction, spoken or typed, rather than the manual-entry form. */
interface ExtractionProvenance {
  source: 'VOICE' | 'MANUAL'
  rawTranscript: string
  language?: 'sw' | 'en'
  confidence: number
}

type LoadState = 'loading' | 'ready' | 'error'

function byNewestFirst(a: LocalTransaction, b: LocalTransaction): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

/**
 * Offline-first (AGENTS.md § 9): reads from the local Dexie cache first
 * (instant, works offline), reconciles with the server in the background,
 * and queues create/update/delete for later sync on a network failure
 * instead of ever discarding the user's transaction. The UI only ever
 * sees "pending" (saved locally, not yet synced) — never IndexedDB or
 * outbox internals (DESIGN.md § 21-22).
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [pendingCount, setPendingCount] = useState(0)
  const isOnline = useOnlineStatus()

  const reloadFromCache = useCallback(async () => {
    const [cached, outboxCount] = await Promise.all([
      localDb.transactions.toArray(),
      localDb.outbox.count(),
    ])
    setTransactions(cached.sort(byNewestFirst))
    setPendingCount(outboxCount)
  }, [])

  const refresh = useCallback(async () => {
    const cachedCount = await localDb.transactions.count()
    if (cachedCount === 0) setState('loading')

    try {
      const server = await apiClient.get<ApiTransaction[]>('/transactions')
      const pendingIds = new Set((await localDb.outbox.toArray()).map((e) => e.localId))

      // Replace every confirmed (non-pending) local record with the
      // server's view; leave anything still queued for sync untouched.
      const stale = await localDb.transactions
        .filter((t) => !t.pending)
        .toArray()
      await localDb.transactions.bulkDelete(stale.map((t) => t.id))
      await localDb.transactions.bulkPut(
        server
          .filter((t) => !pendingIds.has(t.id))
          .map((t) => toLocalTransaction(t, false)),
      )

      await reloadFromCache()
      setState('ready')
    } catch (error) {
      await reloadFromCache()
      const cached = await localDb.transactions.count()
      setState(cached > 0 || isNetworkError(error) ? 'ready' : 'error')
    }
  }, [reloadFromCache])

  const runSync = useCallback(async () => {
    await syncOutbox()
    await reloadFromCache()
  }, [reloadFromCache])

  useEffect(() => {
    // Mount: load the cache first (instant, works offline), then — if
    // there's leftover unsynced data from a previous offline session and
    // we're online right now — flush it before reconciling with the
    // server. reloadFromCache/runSync/refresh only call setState after an
    // await, never synchronously in the effect body.
    async function init() {
      await reloadFromCache()
      if (navigator.onLine) await runSync()
      await refresh()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Skip the first run (the mount effect above already covers the initial
  // online state) — this effect exists to catch actual reconnects.
  const isFirstOnlineCheck = useRef(true)
  useEffect(() => {
    if (isFirstOnlineCheck.current) {
      isFirstOnlineCheck.current = false
      return
    }
    if (!isOnline) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSync().then(refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  const create = useCallback(
    async (
      draft: TransactionDraft,
      currency: CurrencyCode,
      provenance?: ExtractionProvenance,
    ): Promise<LocalTransaction | null> => {
      const tempId = `temp-${crypto.randomUUID()}`
      const optimistic: LocalTransaction = {
        id: tempId,
        createdAt: new Date().toISOString(),
        pending: true,
        currency,
        ...OFFLINE_FALLBACK_RATES,
        ...draft,
      }
      await localDb.transactions.put(optimistic)
      await reloadFromCache()

      const payload = { ...draft, currency, ...provenance }

      try {
        const created = await apiClient.post<ApiTransaction>('/transactions', payload)
        await localDb.transactions.delete(tempId)
        const local = toLocalTransaction(created, false)
        await localDb.transactions.put(local)
        await reloadFromCache()
        return local
      } catch (error) {
        if (isNetworkError(error)) {
          const entry: OutboxEntry = {
            id: crypto.randomUUID(),
            op: 'create',
            localId: tempId,
            payload,
            createdAt: new Date().toISOString(),
          }
          await localDb.outbox.put(entry)
          await reloadFromCache()
          return optimistic
        }
        await localDb.transactions.delete(tempId)
        await reloadFromCache()
        return null
      }
    },
    [reloadFromCache],
  )

  const update = useCallback(
    async (id: string, draft: TransactionDraft): Promise<boolean> => {
      const previous = await localDb.transactions.get(id)
      if (!previous) return false

      await localDb.transactions.put({ ...previous, ...draft, pending: true })
      await reloadFromCache()

      // Still-unsynced local create — just update the queued payload.
      if (id.startsWith('temp-')) {
        const pendingCreate = await localDb.outbox.where('localId').equals(id).first()
        if (pendingCreate) {
          await localDb.outbox.update(pendingCreate.id, { payload: { ...draft } })
        }
        return true
      }

      try {
        const updated = await apiClient.patch<ApiTransaction>(`/transactions/${id}`, draft)
        await localDb.transactions.put(toLocalTransaction(updated, false))
        await reloadFromCache()
        return true
      } catch (error) {
        if (isNetworkError(error)) {
          await localDb.outbox.put({
            id: crypto.randomUUID(),
            op: 'update',
            localId: id,
            payload: { ...draft },
            createdAt: new Date().toISOString(),
          })
          await reloadFromCache()
          return true
        }
        await localDb.transactions.put(previous)
        await reloadFromCache()
        return false
      }
    },
    [reloadFromCache],
  )

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const previous = await localDb.transactions.get(id)
      if (!previous) return false

      await localDb.transactions.delete(id)
      await reloadFromCache()

      // Never-synced local create — cancel it outright, nothing to tell the server.
      if (id.startsWith('temp-')) {
        const queued = await localDb.outbox.where('localId').equals(id).toArray()
        await localDb.outbox.bulkDelete(queued.map((e) => e.id))
        return true
      }

      try {
        await apiClient.delete(`/transactions/${id}`)
        return true
      } catch (error) {
        if (isNetworkError(error)) {
          await localDb.outbox.put({
            id: crypto.randomUUID(),
            op: 'delete',
            localId: id,
            createdAt: new Date().toISOString(),
          })
          return true
        }
        await localDb.transactions.put(previous)
        await reloadFromCache()
        return false
      }
    },
    [reloadFromCache],
  )

  return {
    transactions,
    state,
    pendingCount,
    isOnline,
    refresh,
    create,
    update,
    remove,
  }
}
