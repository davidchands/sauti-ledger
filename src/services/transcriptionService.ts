import { getDeviceId } from '@/lib/deviceId'
import { ApiError } from '@/lib/apiClient'

export interface TranscriptionResult {
  transcript: string
  language: string | null
}

export async function transcribeAudio(audio: Blob): Promise<TranscriptionResult> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': audio.type || 'audio/webm',
      'X-Device-Id': getDeviceId(),
    },
    body: audio,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body?.error ?? 'Transcription failed')
  }

  return response.json() as Promise<TranscriptionResult>
}
