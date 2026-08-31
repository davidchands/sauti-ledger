import { useLanguage } from '@/i18n/useLanguage'
import type { Language } from '@/i18n/translations'

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'sw', label: 'SW' },
  { value: 'en', label: 'EN' },
]

/**
 * A segmented control, not the in-app single-tap toggle (LanguageSwitcher)
 * — a visitor lands here with no context for what one unlabeled button
 * does, so both languages are shown at once with the active one
 * highlighted, and either can be tapped directly.
 */
export function LandingLanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('language.switchTo')}
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            language === option.value
              ? 'bg-text text-bg'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
