import { Mic } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'

/**
 * Visual placeholder for the primary voice action. Recording, transcription,
 * and extraction are wired up in later phases (see AGENTS.md § 18).
 */
export function MicButton() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={t('mic.idle')}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-text text-bg transition-transform active:scale-95"
      >
        <Mic size={32} strokeWidth={2} />
      </button>
      <p className="text-sm font-medium text-text-muted">{t('mic.idle')}</p>
    </div>
  )
}
