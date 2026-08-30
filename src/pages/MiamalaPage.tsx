import { MicButton } from '@/components/MicButton'
import { useLanguage } from '@/i18n/useLanguage'

export function MiamalaPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-8">
        <p className="text-center text-base text-text-muted">{t('miamala.empty')}</p>
        <p className="mt-2 text-center text-sm text-text-muted">{t('mic.idleHint')}</p>
      </div>

      <div className="flex justify-center py-6">
        <MicButton />
      </div>
    </div>
  )
}
