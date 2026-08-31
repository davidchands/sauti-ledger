import { Loader2, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'
import type { TranslationPath } from '@/i18n/translations'
import type { VoiceCaptureUiState } from '@/hooks/useVoiceCapture'
import type { RecorderErrorReason } from '@/hooks/useAudioRecorder'

const RECORDER_ERROR_COPY: Record<
  RecorderErrorReason,
  { title: TranslationPath; body: TranslationPath }
> = {
  'permission-denied': {
    title: 'recorder.permissionDeniedTitle',
    body: 'recorder.permissionDeniedBody',
  },
  'no-microphone': { title: 'recorder.noMicrophoneTitle', body: 'recorder.noMicrophoneBody' },
  unsupported: { title: 'recorder.unsupportedTitle', body: 'recorder.unsupportedBody' },
  unknown: { title: 'recorder.unknownTitle', body: 'recorder.unknownBody' },
}

interface VoiceStatusPanelProps {
  uiState: VoiceCaptureUiState
  recorderError: RecorderErrorReason | null
  /** Clears the error/clarify state — the user retries by holding the mic again. */
  onDismiss: () => void
}

/**
 * Lightweight, non-blocking feedback for what happens after release —
 * processing, asking for clarification, or an error. Deliberately not a
 * full-screen modal: holding the mic is the whole interaction now, so
 * this should feel like a toast, not a takeover.
 */
export function VoiceStatusPanel({ uiState, recorderError, onDismiss }: VoiceStatusPanelProps) {
  const { t } = useLanguage()

  if (uiState === 'transcribing' || uiState === 'extracting') {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-lg">
        <Loader2 size={16} className="animate-spin text-text-muted" aria-hidden="true" />
        <p className="text-sm text-text-muted">{t('recorder.transcribing')}</p>
      </div>
    )
  }

  if (uiState === 'clarify') {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-center shadow-lg">
        <p className="text-sm font-medium text-text">{t('recorder.clarifyTitle')}</p>
        <p className="text-xs text-text-muted">{t('recorder.clarifyBody')}</p>
        <button type="button" onClick={onDismiss} className="mt-1 text-xs font-medium text-text-muted underline">
          {t('recorder.cancel')}
        </button>
      </div>
    )
  }

  if (uiState === 'transcribeError' || uiState === 'extractError') {
    const body =
      uiState === 'transcribeError' ? t('recorder.transcribeErrorBody') : t('recorder.extractErrorBody')
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-center shadow-lg">
        <AlertCircle size={18} className="text-warning" aria-hidden="true" />
        <p className="text-sm font-medium text-text">
          {uiState === 'transcribeError' ? t('recorder.transcribeErrorTitle') : t('recorder.extractErrorTitle')}
        </p>
        <p className="text-xs text-text-muted">{body}</p>
        <button type="button" onClick={onDismiss} className="mt-1 text-xs font-medium text-text-muted underline">
          {t('recorder.close')}
        </button>
      </div>
    )
  }

  if (uiState === 'recorderError' && recorderError) {
    const copy = RECORDER_ERROR_COPY[recorderError]
    const canRetry = recorderError !== 'unsupported' && recorderError !== 'no-microphone'
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-center shadow-lg">
        <AlertCircle size={18} className="text-warning" aria-hidden="true" />
        <p className="text-sm font-medium text-text">{t(copy.title)}</p>
        <p className="text-xs text-text-muted">{t(copy.body)}</p>
        {canRetry && (
          <button type="button" onClick={onDismiss} className="mt-1 text-xs font-medium text-text underline">
            {t('error.retry')}
          </button>
        )}
      </div>
    )
  }

  return null
}
