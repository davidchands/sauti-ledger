import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { useTransactionsContext } from '@/hooks/useTransactionsContext'

const SYNCED_DISPLAY_MS = 2500

type Phase = 'hidden' | 'pending' | 'synced'

/**
 * The only sync-related thing the merchant ever sees (DESIGN.md § 21-22):
 * "Saved on your phone" while there's unsynced local data, a brief
 * "Synced" once everything catches up, then nothing. Never IndexedDB,
 * outbox, or service-worker language.
 */
export function SyncIndicator() {
  const { t } = useLanguage()
  const { pendingCount } = useTransactionsContext()
  const [phase, setPhase] = useState<Phase>(pendingCount > 0 ? 'pending' : 'hidden')

  // Adjust state during render on a pendingCount change (React's documented
  // "Adjusting state when a prop changes" pattern — plain useState, not a
  // ref, so it stays compatible with the compiler-oriented lint rules).
  const [prevPendingCount, setPrevPendingCount] = useState(pendingCount)
  if (pendingCount !== prevPendingCount) {
    setPrevPendingCount(pendingCount)
    if (pendingCount > 0) {
      setPhase('pending')
    } else if (phase === 'pending') {
      setPhase('synced')
    }
  }

  useEffect(() => {
    if (phase !== 'synced') return
    const timeout = setTimeout(() => setPhase('hidden'), SYNCED_DISPLAY_MS)
    return () => clearTimeout(timeout)
  }, [phase])

  if (phase === 'hidden') return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-text-muted"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${phase === 'pending' ? 'bg-warning' : 'bg-income'}`}
        aria-hidden="true"
      />
      {phase === 'pending' ? t('sync.savedOnPhone') : t('sync.synced')}
    </div>
  )
}
