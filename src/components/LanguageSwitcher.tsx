import { useLanguage } from '@/i18n/useLanguage'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const nextLanguage = language === 'sw' ? 'en' : 'sw'

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={t('language.switchTo')}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted"
    >
      {language === 'sw' ? 'SW' : 'EN'}
    </button>
  )
}
