import { useLanguage } from '@/i18n/useLanguage'

export function RipotiPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <p className="text-base text-text-muted">{t('ripoti.empty')}</p>
    </div>
  )
}
