import { AlertCircle } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'

interface ErrorStateProps {
  title?: string
  body?: string
  onRetry?: () => void
}

/**
 * Errors must say what happened, whether data is safe, and what to do next
 * (DESIGN.md § 21) — never a raw error code or stack trace.
 */
export function ErrorState({ title, body, onRetry }: ErrorStateProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center" role="alert">
      <AlertCircle size={24} className="text-warning" aria-hidden="true" />
      <p className="text-base font-medium text-text">{title ?? t('error.genericTitle')}</p>
      <p className="text-sm text-text-muted">{body ?? t('error.genericBody')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text"
        >
          {t('error.retry')}
        </button>
      )}
    </div>
  )
}
