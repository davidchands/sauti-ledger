import { Mic, Loader2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/i18n/useLanguage'
import type { TranslationPath } from '@/i18n/translations'

export type VoiceButtonState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

const STATE_LABEL_KEY: Record<VoiceButtonState, TranslationPath> = {
  idle: 'mic.idle',
  recording: 'mic.recording',
  processing: 'mic.processing',
  success: 'mic.success',
  error: 'mic.error',
}

interface VoiceButtonProps {
  state: VoiceButtonState
  onPress?: () => void
}

/**
 * The primary voice action (DESIGN.md § 13-14). Purely presentational here —
 * recording/transcription/extraction are wired up starting Phase 5.
 */
export function VoiceButton({ state, onPress }: VoiceButtonProps) {
  const { t } = useLanguage()
  const label = t(STATE_LABEL_KEY[state])

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onPress}
        aria-label={label}
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full transition-transform active:scale-95',
          state === 'recording' && 'bg-expense text-white',
          state === 'success' && 'bg-income-bg text-income',
          state === 'error' && 'bg-warning-bg text-warning',
          (state === 'idle' || state === 'processing') && 'bg-text text-bg',
        )}
      >
        {state === 'idle' && <Mic size={32} strokeWidth={2} />}
        {state === 'recording' && (
          <span className="h-4 w-4 animate-pulse rounded-full bg-white" aria-hidden="true" />
        )}
        {state === 'processing' && (
          <Loader2 size={32} className="animate-spin" aria-hidden="true" />
        )}
        {state === 'success' && <Check size={32} strokeWidth={2.5} aria-hidden="true" />}
        {state === 'error' && <AlertCircle size={32} aria-hidden="true" />}
      </button>
      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  )
}
