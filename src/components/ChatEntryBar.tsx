import { useRef, useState } from 'react'
import { ArrowUp, Loader2, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'
import type { ChatEntryStatus } from '@/hooks/useChatEntry'

interface ChatEntryBarProps {
  status: ChatEntryStatus
  onSubmit: (text: string) => void
  onDismiss: () => void
}

/**
 * WhatsApp-style text entry: type what happened, send, and the same
 * extraction pipeline voice uses turns it into a transaction (AI_SPEC.md).
 * Replaces filling in a form as the default manual-entry path — the
 * structured form still exists for editing an already-saved transaction.
 */
export function ChatEntryBar({ status, onSubmit, onDismiss }: ChatEntryBarProps) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const busy = status === 'extracting'

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!text.trim() || busy) return
    onSubmit(text)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {status === 'clarify' && (
        <StatusMessage
          icon={<AlertCircle size={16} className="text-warning" aria-hidden="true" />}
          text={t('chatEntry.clarifyBody')}
          onDismiss={onDismiss}
        />
      )}
      {status === 'error' && (
        <StatusMessage
          icon={<AlertCircle size={16} className="text-warning" aria-hidden="true" />}
          text={t('chatEntry.errorTitle')}
          onDismiss={onDismiss}
        />
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('chatEntry.placeholder')}
          disabled={busy}
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-3 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          aria-label={t('chatEntry.send')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-text text-bg transition-opacity disabled:opacity-30"
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp size={20} aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  )
}

function StatusMessage({
  icon,
  text,
  onDismiss,
}: {
  icon: React.ReactNode
  text: string
  onDismiss: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-left shadow-lg">
      {icon}
      <p className="flex-1 text-xs text-text-muted">{text}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-xs font-medium text-text-muted underline"
      >
        {t('recorder.close')}
      </button>
    </div>
  )
}
