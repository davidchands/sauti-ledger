import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioRecorder, type RecorderErrorReason } from './useAudioRecorder'
import { transcribeAudio } from '@/services/transcriptionService'
import { extractTransactions } from '@/services/extractionService'
import { normalizeLanguage } from '@/lib/language'
import type { TransactionDraft } from '@/components/TransactionFields'

export interface VoiceExtractionItem {
  draft: TransactionDraft
  confidence: number
}

/**
 * One recording can describe more than one transaction (AI_SPEC.md §
 * 3a) — items is always non-empty, usually with a single entry.
 */
export interface VoiceExtraction {
  items: VoiceExtractionItem[]
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
export function useVoiceCapture(onExtracted: (result: VoiceExtraction) => void) {
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
      const results = await extractTransactions(transcript)
      // Drop items the model couldn't pin down rather than blocking the
      // whole recording on one ambiguous mention — only ask the user to
      // clarify if nothing usable came out of it at all.
      const usable = results.filter(
        (item): item is typeof item & { type: 'INCOME' | 'EXPENSE'; amount: number } =>
          !item.needsClarification && item.type !== null && item.amount !== null,
      )
      if (usable.length === 0) {
        setFlow({ status: 'clarify' })
        return
      }
      setFlow({ status: 'idle' })
      onExtractedRef.current({
        items: usable.map((item) => ({
          draft: {
            type: item.type,
            amount: item.amount,
            category: item.category,
            description: item.description,
          },
          confidence: item.confidence,
        })),
        rawTranscript: transcript,
        language: normalizeLanguage(language),
      })
    } catch {
      setFlow({ status: 'extractError' })
    }
  }, [])

  const recorder = useAudioRecorder(runPipeline)

  // Clears an error/clarify state — the user retries by holding the mic again.
  const retryFromRecording = useCallback(() => {
    setFlow({ status: 'idle' })
    recorder.reset()
  }, [recorder])

  const uiState: VoiceCaptureUiState =
    recorder.phase === 'error' ? 'recorderError' : flow.status !== 'idle' ? flow.status : recorder.phase

  return {
    uiState,
    recorderError: recorder.error as RecorderErrorReason | null,
    durationMs: recorder.durationMs,
    levels: recorder.levels,
    start: recorder.start,
    stop: recorder.stop,
    cancel: recorder.cancel,
    retryFromRecording,
  }
}
