import Dexie, { type Table } from 'dexie'
import type { Transaction } from '@/types/transaction'

/**
 * Local-only cache + outbox for offline-first (AGENTS.md § 9). Never
 * exposed to the merchant — the UI only ever shows "saved on phone" /
 * "synced" (DESIGN.md § 21-22), never IndexedDB or queue internals.
 */
export interface LocalTransaction extends Transaction {
  /** True until the server has confirmed this record. */
  pending: boolean
}

export interface OutboxEntry {
  id: string
  op: 'create' | 'update' | 'delete'
  /** The transaction id this entry targets — a temp id until its create syncs. */
  localId: string
  payload?: Record<string, unknown>
  createdAt: string
}

class LocalDb extends Dexie {
  transactions!: Table<LocalTransaction, string>
  outbox!: Table<OutboxEntry, string>

  constructor() {
    super('sautiledger')
    this.version(1).stores({
      transactions: 'id, createdAt, pending',
      outbox: 'id, createdAt, localId',
    })
  }
}

export const localDb = new LocalDb()
