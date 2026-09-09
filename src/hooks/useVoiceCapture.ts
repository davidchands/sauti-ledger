import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioRecorder, type RecorderErrorReason } from './useAudioRecorder'
import { useLiveCaption } from './useLiveCaption'
import { transcribeAudio } from '@/services/transcriptionService'
import { extractUsableItems, type ExtractionItem } from '@/lib/transactionExtraction'
import { normalizeLanguage } from '@/lib/language'

/** A best-guess locale for the on-screen caption engine only — the real pipeline (Groq Whisper) never uses this and stays language-agnostic per AGENTS.md § 4. */
const CAPTION_LOCALE: Record<'sw' | 'en', string> = { sw: 'sw-TZ', en: 'en-US' }

/**
 * One recording can describe more than one transaction (AI_SPEC.md §
 * 3a) — items is always non-empty, usually with a single entry.
 */
export interface VoiceExtraction {
  items: ExtractionItem[]
  rawTranscript: string
  language?: 'sw' | 'en'
}

type PipelineFlow =
  | { status: 'idle' }
  | { status: 'transcribing' }
  | { status: 'transcribeError' }
  | { status: 'extracting' }
  | { status: 'extractError' }
  | { status: 'clarify' }

export type VoiceCaptureUiState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'recorderError'
  | PipelineFlow['status']

/**
 * Press-and-hold voice capture: record -> transcribe -> extract, chained
 * automatically on release. No manual "review the recording" step — the
 * only human-in-the-loop moment is confirming the extracted transaction
 * itself (DESIGN.md § 14-15), not the raw audio. Shared by the mobile
 * hold-the-mic-button gesture and the desktop hold-Space gesture so both
 * surfaces get identical behavior from one implementation.
 */
export function useVoiceCapture(
  onExtracted: (result: VoiceExtraction) => void,
  uiLanguage: 'sw' | 'en' = 'sw',
) {
  const [flow, setFlow] = useState<PipelineFlow>({ status: 'idle' })
  const onExtractedRef = useRef(onExtracted)
  useEffect(() => {
    onExtractedRef.current = onExtracted
  }, [onExtracted])

  const runPipeline = useCallback(async (blob: Blob) => {
    setFlow({ status: 'transcribing' })

    let transcript: string
    let language: string | null
    try {
      const result = await transcribeAudio(blob)
      transcript = result.transcript
      language = result.language
    } catch {
      setFlow({ status: 'transcribeError' })
      return
    }

    setFlow({ status: 'extracting' })
    try {
      const items = await extractUsableItems(transcript)
      if (items.length === 0) {
        setFlow({ status: 'clarify' })
        return
      }
      setFlow({ status: 'idle' })
      onExtractedRef.current({
        items,
        rawTranscript: transcript,
        language: normalizeLanguage(language),
      })
    } catch {
      setFlow({ status: 'extractError' })
    }
  }, [])

  const recorder = useAudioRecorder(runPipeline)
  const liveCaption = useLiveCaption(CAPTION_LOCALE[uiLanguage])

  // Clears an error/clarify state — the user retries by holding the mic again.
  const retryFromRecording = useCallback(() => {
    setFlow({ status: 'idle' })
    recorder.reset()
  }, [recorder])

  const uiState: VoiceCaptureUiState =
    recorder.phase === 'error' ? 'recorderError' : flow.status !== 'idle' ? flow.status : recorder.phase

  // Live captions ride alongside the recorder, purely for on-screen
  // display (promo/screen-recording friendly) — they never feed the
  // actual transcript/extraction pipeline above.
  const start = useCallback(() => {
    recorder.start()
    liveCaption.start()
  }, [recorder, liveCaption])

  const stop = useCallback(() => {
    recorder.stop()
    liveCaption.stop()
  }, [recorder, liveCaption])

  const cancel = useCallback(() => {
    recorder.cancel()
    liveCaption.stop()
  }, [recorder, liveCaption])

  return {
    uiState,
    recorderError: recorder.error as RecorderErrorReason | null,
    durationMs: recorder.durationMs,
    levels: recorder.levels,
    caption: liveCaption.caption,
    isCaptionSupported: liveCaption.isSupported,
    start,
    stop,
    cancel,
    retryFromRecording,
  }
}
