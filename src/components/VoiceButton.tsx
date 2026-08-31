import { Mic, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/i18n/useLanguage'
import type { VoiceCaptureUiState } from '@/hooks/useVoiceCapture'

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface VoiceButtonProps {
  uiState: VoiceCaptureUiState
  levels: number[]
  durationMs: number
  onPressStart: () => void
  onPressEnd: () => void
}

/**
 * The primary voice action (DESIGN.md § 13-14): press and hold, speak,
 * release. No separate record/confirm-the-recording tap — holding IS the
 * gesture, matching the product decision to remove that friction. Pointer
 * events unify mouse (desktop click-and-hold) and touch (mobile) in one
 * handler; the desktop Space-key hotkey drives the same start/stop props
 * from MiamalaPage, so this component doesn't need to know which trigger
 * fired it.
 */
export function VoiceButton({
  uiState,
  levels,
  durationMs,
  onPressStart,
  onPressEnd,
}: VoiceButtonProps) {
  const { t } = useLanguage()
  const isRecording = uiState === 'recording'
  const isRequesting = uiState === 'requesting'
  const label = isRecording ? t('mic.recording') : isRequesting ? t('recorder.requesting') : t('mic.idle')

  return (
    <div className="flex flex-col items-center gap-2">
      {isRecording && (
        <div
          className="flex h-8 items-center justify-center gap-0.5"
          role="img"
          aria-label={t('mic.recording')}
        >
          {levels.map((level, index) => (
            <span
              key={index}
              className="w-1 rounded-full bg-expense motion-reduce:h-1.5"
              style={{ height: `${Math.max(6, level * 32)}px` }}
            />
          ))}
        </div>
      )}

      <div className="relative flex h-20 w-20 items-center justify-center">
        {isRecording && (
          <>
            <span
              aria-hidden="true"
              className="absolute -inset-5 -z-10 rounded-full blur-lg"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, var(--color-expense) 25%, transparent 55%)',
                animation: 'mic-beam-rotate 2.2s linear infinite',
              }}
            />
            {[0, 0.6, 1.2].map((delay) => (
              <span
                key={delay}
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full border-2 border-expense"
                style={{ animation: `mic-pulse-ring 1.8s ease-out ${delay}s infinite` }}
              />
            ))}
          </>
        )}

        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault()
            onPressStart()
          }}
          onPointerUp={onPressEnd}
          onPointerLeave={isRecording ? onPressEnd : undefined}
          onPointerCancel={onPressEnd}
          aria-label={label}
          className={cn(
            'flex h-20 w-20 select-none items-center justify-center rounded-full transition-transform active:scale-95',
            isRecording && 'scale-110 bg-expense text-white',
            !isRecording && 'bg-text text-bg',
          )}
          style={{ touchAction: 'none' }}
        >
          {isRequesting ? (
            <Loader2 size={32} className="animate-spin" aria-hidden="true" />
          ) : isRecording ? (
            <span className="text-base font-semibold tabular-nums">{formatDuration(durationMs)}</span>
          ) : (
            <Mic size={32} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  )
}
