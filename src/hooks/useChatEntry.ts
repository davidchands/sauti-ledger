import { useCallback, useState } from 'react'
import { extractUsableItems, type ExtractionItem } from '@/lib/transactionExtraction'

/**
 * A typed message can describe more than one transaction, same as
 * voice (AI_SPEC.md § 3a) — items is always non-empty.
 */
export interface ChatExtraction {
  items: ExtractionItem[]
  rawTranscript: string
}

export type ChatEntryStatus = 'idle' | 'extracting' | 'clarify' | 'error'

/**
 * Text-typed equivalent of useVoiceCapture: the same extraction pipeline
 * (extractUsableItems), just skipping the record/transcribe step since
 * the transcript already exists as typed text. Chat-style manual entry
 * replaces the old fill-in-a-form flow for the common case.
 */
export function useChatEntry(onExtracted: (result: ChatExtraction) => void) {
  const [status, setStatus] = useState<ChatEntryStatus>('idle')

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      setStatus('extracting')
      try {
        const items = await extractUsableItems(trimmed)
        if (items.length === 0) {
          setStatus('clarify')
          return
        }
        setStatus('idle')
        onExtracted({ items, rawTranscript: trimmed })
      } catch {
        setStatus('error')
      }
    },
    [onExtracted],
  )

  const reset = useCallback(() => setStatus('idle'), [])

  return { status, submit, reset }
}
