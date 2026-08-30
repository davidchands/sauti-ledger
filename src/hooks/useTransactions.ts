import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/transaction'
import type { TransactionDraft } from '@/components/TransactionFields'

interface ApiTransaction {
  id: string
  type: TransactionType
  amount: number
  category: TransactionCategory
  description: string
  createdAt: string
}

function toUiTransaction(api: ApiTransaction): Transaction {
  return {
    id: api.id,
    type: api.type,
    amount: api.amount,
    category: api.category,
    description: api.description,
    createdAt: api.createdAt,
  }
}

interface VoiceProvenance {
  source: 'VOICE'
  rawTranscript: string
  language?: 'sw' | 'en'
  confidence: number
}

type LoadState = 'loading' | 'ready' | 'error'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [state, setState] = useState<LoadState>('loading')

  const refresh = useCallback(async () => {
    setState('loading')
    try {
      const list = await apiClient.get<ApiTransaction[]>('/transactions')
      setTransactions(list.map(toUiTransaction))
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    // Standard fetch-on-mount — refresh() is async and only calls setState
    // after an await, not synchronously within the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  // Optimistic create (AGENTS.md § 8): show it immediately, reconcile with
  // the server, roll back on failure. Voice-sourced creates (Phase 7) pass
  // provenance fields through; manual entries omit them (defaults MANUAL).
  const create = useCallback(async (draft: TransactionDraft, voice?: VoiceProvenance) => {
    const tempId = `temp-${crypto.randomUUID()}`
    const optimistic: Transaction = { id: tempId, createdAt: new Date().toISOString(), ...draft }
    setTransactions((prev) => [optimistic, ...prev])

    try {
      const created = await apiClient.post<ApiTransaction>('/transactions', { ...draft, ...voice })
      setTransactions((prev) => prev.map((t) => (t.id === tempId ? toUiTransaction(created) : t)))
      return true
    } catch {
      setTransactions((prev) => prev.filter((t) => t.id !== tempId))
      return false
    }
  }, [])

  const update = useCallback(async (id: string, draft: TransactionDraft) => {
    let previous: Transaction[] = []
    setTransactions((prev) => {
      previous = prev
      return prev.map((t) => (t.id === id ? { ...t, ...draft } : t))
    })

    try {
      const updated = await apiClient.patch<ApiTransaction>(`/transactions/${id}`, draft)
      setTransactions((prev) => prev.map((t) => (t.id === id ? toUiTransaction(updated) : t)))
      return true
    } catch {
      setTransactions(previous)
      return false
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    let previous: Transaction[] = []
    setTransactions((prev) => {
      previous = prev
      return prev.filter((t) => t.id !== id)
    })

    try {
      await apiClient.delete(`/transactions/${id}`)
      return true
    } catch {
      setTransactions(previous)
      return false
    }
  }, [])

  const balance = transactions.reduce(
    (sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount),
    0,
  )

  return { transactions, balance, state, refresh, create, update, remove }
}
