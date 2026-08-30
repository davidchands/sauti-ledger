import { useEffect, useState } from 'react'
import { Loader2, Square, X } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'
import type { TranslationPath } from '@/i18n/translations'
import { useAudioRecorder, type RecorderErrorReason } from '@/hooks/useAudioRecorder'
import { transcribeAudio } from '@/services/transcriptionService'
import { extractTransaction } from '@/services/extractionService'
import { normalizeLanguage } from '@/lib/language'
import type { TransactionDraft } from '@/components/TransactionFields'

const ERROR_COPY: Record<RecorderErrorReason, { title: TranslationPath; body: TranslationPath }> = {
  'permission-denied': {
    title: 'recorder.permissionDeniedTitle',
    body: 'recorder.permissionDeniedBody',
  },
  'no-microphone': {
    title: 'recorder.noMicrophoneTitle',
    body: 'recorder.noMicrophoneBody',
  },
  unsupported: {
    title: 'recorder.unsupportedTitle',
    body: 'recorder.unsupportedBody',
  },
  unknown: {
    title: 'recorder.unknownTitle',
    body: 'recorder.unknownBody',
  },
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export interface VoiceExtraction {
  draft: TransactionDraft
  rawTranscript: string
  language?: 'sw' | 'en'
  confidence: number
}

type FlowState =
  | { status: 'idle' }
  | { status: 'transcribing' }
  | { status: 'transcribeError' }
  | { status: 'extracting'; transcript: string }
  | { status: 'extractError' }
  | { status: 'clarify' }

interface VoiceRecorderSheetProps {
  onClose: () => void
  /** Called once with a confident extraction — the parent owns the preview/confirm UI. */
  onExtracted: (result: VoiceExtraction) => void
}

/**
 * Real microphone capture (Phase 5), Groq transcription (Phase 6), and
 * Gemini extraction (Phase 7): permission -> record -> review -> transcript
 * -> structured draft. Gemini's output is Zod-validated server-side and
 * never trusted directly; ambiguous results ask for clarification instead
 * of guessing (AI_SPEC.md § 4). The sheet hands off to the parent once it
 * has a confident draft — it never saves anything itself.
 */
export function VoiceRecorderSheet({ onClose, onExtracted }: VoiceRecorderSheetProps) {
  const { t } = useLanguage()
  const { phase, error, durationMs, levels, audioUrl, audioBlob, start, stop, cancel, retry } =
    useAudioRecorder()
  const [flow, setFlow] = useState<FlowState>({ status: 'idle' })

  useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = () => {
    cancel()
    onClose()
  }

  const handleRetry = () => {
    setFlow({ status: 'idle' })
    retry()
  }

  const runExtraction = async (transcript: string, language: 'sw' | 'en' | undefined) => {
    setFlow({ status: 'extracting', transcript })
    try {
      const result = await extractTransaction(transcript)
      if (result.needsClarification || !result.type || result.amount === null) {
        setFlow({ status: 'clarify' })
        return
      }
      onExtracted({
        draft: {
          type: result.type,
          amount: result.amount,
          category: result.category,
          description: result.description,
        },
        rawTranscript: transcript,
        language,
        confidence: result.confidence,
      })
    } catch {
      setFlow({ status: 'extractError' })
    }
  }

  const handleUse = async () => {
    if (!audioBlob) return
    setFlow({ status: 'transcribing' })
    try {
      const { transcript, language } = await transcribeAudio(audioBlob)
      await runExtraction(transcript, normalizeLanguage(language))
    } catch {
      setFlow({ status: 'transcribeError' })
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('mic.idle')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="flex w-full max-w-[430px] flex-col items-center gap-6 rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
        {phase === 'requesting' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={32} className="animate-spin text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-muted">{t('recorder.requesting')}</p>
          </div>
        )}

        {phase === 'recording' && (
          <>
            <p className="text-lg font-semibold text-text">{t('mic.recording')}</p>
            <p className="text-3xl font-semibold tabular-nums text-text">
              {formatDuration(durationMs)}
            </p>
            <div
              className="flex h-16 w-full items-center justify-center gap-1"
              role="img"
              aria-label={t('mic.recording')}
            >
              {levels.map((level, index) => (
                <span
                  key={index}
                  className="w-1.5 flex-1 rounded-full bg-expense motion-reduce:h-2"
                  style={{ height: `${Math.max(8, level * 64)}px` }}
                />
              ))}
            </div>
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={handleCancel}
                aria-label={t('recorder.cancel')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                <X size={18} aria-hidden="true" />
                {t('recorder.cancel')}
              </button>
              <button
                type="button"
                onClick={stop}
                aria-label={t('recorder.stop')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-expense py-3.5 text-base font-semibold text-white"
              >
                <Square size={18} aria-hidden="true" />
                {t('recorder.stop')}
              </button>
            </div>
          </>
        )}

        {phase === 'reviewing' && audioUrl && flow.status === 'idle' && (
          <>
            <p className="text-lg font-semibold text-text">{formatDuration(durationMs)}</p>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- voice memo, no captionable track */}
            <audio src={audioUrl} controls className="w-full" />
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={retry}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('recorder.retry')}
              </button>
              <button
                type="button"
                onClick={handleUse}
                className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg"
              >
                {t('recorder.use')}
              </button>
            </div>
          </>
        )}

        {flow.status === 'transcribing' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={32} className="animate-spin text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-muted">{t('recorder.transcribing')}</p>
          </div>
        )}

        {flow.status === 'extracting' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={32} className="animate-spin text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-muted">{t('recorder.extracting')}</p>
          </div>
        )}

        {flow.status === 'transcribeError' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-base font-medium text-text">{t('recorder.transcribeErrorTitle')}</p>
            <p className="text-sm text-text-muted">{t('recorder.transcribeErrorBody')}</p>
            <div className="mt-2 flex w-full gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('recorder.cancel')}
              </button>
              <button
                type="button"
                onClick={handleUse}
                className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg"
              >
                {t('error.retry')}
              </button>
            </div>
          </div>
        )}

        {flow.status === 'extractError' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-base font-medium text-text">{t('recorder.extractErrorTitle')}</p>
            <p className="text-sm text-text-muted">{t('recorder.extractErrorBody')}</p>
            <div className="mt-2 flex w-full gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('recorder.cancel')}
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg"
              >
                {t('recorder.retry')}
              </button>
            </div>
          </div>
        )}

        {flow.status === 'clarify' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-base font-medium text-text">{t('recorder.clarifyTitle')}</p>
            <p className="text-sm text-text-muted">{t('recorder.clarifyBody')}</p>
            <div className="mt-2 flex w-full gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('recorder.cancel')}
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg"
              >
                {t('recorder.retry')}
              </button>
            </div>
          </div>
        )}

        {phase === 'error' && error && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-base font-medium text-text">{t(ERROR_COPY[error].title)}</p>
            <p className="text-sm text-text-muted">{t(ERROR_COPY[error].body)}</p>
            <div className="mt-2 flex w-full gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3.5 text-base font-medium text-text-muted"
              >
                {t('recorder.cancel')}
              </button>
              {error !== 'unsupported' && error !== 'no-microphone' && (
                <button
                  type="button"
                  onClick={start}
                  className="flex-1 rounded-xl bg-text py-3.5 text-base font-semibold text-bg"
                >
                  {t('error.retry')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
