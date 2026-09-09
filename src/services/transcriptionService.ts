import { getDeviceId } from '@/lib/deviceId'
import { ApiError } from '@/lib/apiClient'

export interface TranscriptionResult {
  transcript: string
  language: string | null
}

/**
 * `languageHint` ('sw' | 'en') is only ever passed by the live-caption
 * chunker, to stop short chunks flip-flopping into the wrong detected
 * language mid-recording — see server/lib/groq.ts. The real, saved
 * transcript never passes one.
 */
export async function transcribeAudio(
  audio: Blob,
  languageHint?: 'sw' | 'en',
): Promise<TranscriptionResult> {
  const headers: Record<string, string> = {
    'Content-Type': audio.type || 'audio/webm',
    'X-Device-Id': getDeviceId(),
  }
  if (languageHint) {
    headers['X-Language-Hint'] = languageHint
  }

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers,
    body: audio,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body?.error ?? 'Transcription failed')
  }

  return response.json() as Promise<TranscriptionResult>
}
