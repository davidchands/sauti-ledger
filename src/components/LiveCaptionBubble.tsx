import { useLanguage } from '@/i18n/useLanguage'

interface LiveCaptionBubbleProps {
  caption: string
}

/**
 * On-screen live captions while the mic is held — displays
 * useLiveTranscriptionChunks' running transcript, built so a screen
 * recording of the app reads clearly for promo videos. That hook
 * reuses the same Groq Whisper pipeline that produces the real,
 * saved transcript; this component only ever shows text, never
 * feeds anything back into extraction.
 */
export function LiveCaptionBubble({ caption }: LiveCaptionBubbleProps) {
  const { t } = useLanguage()

  return (
    <div
      className="flex max-w-xs flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-3 text-center shadow-lg"
      style={{ animation: 'caption-pop 0.25s ease-out' }}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-expense uppercase">
        <span
          className="h-1.5 w-1.5 rounded-full bg-expense"
          style={{ animation: 'live-dot-pulse 1.2s ease-in-out infinite' }}
          aria-hidden="true"
        />
        {t('mic.recording')}
      </span>
      {caption && <p className="text-sm text-text">{caption}</p>}
    </div>
  )
}
