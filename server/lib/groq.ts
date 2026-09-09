const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const MODEL = 'whisper-large-v3'

export interface TranscriptionResult {
  transcript: string
  language: string | null
}

/**
 * Server-only. GROQ_API_KEY never reaches the client (AGENTS.md § 3).
 * No language hint is sent for the real, saved transcript — Whisper
 * auto-detects, which is what lets it handle Swahili/English
 * code-switching (AI_SPEC.md). `languageHint` exists only for the
 * on-screen live-caption chunker (useLiveTranscriptionChunks): short
 * (~1.4s) chunks are too little audio for reliable auto-detection on
 * their own, so once the first chunk of a recording detects a
 * language, later chunks in that same recording pass it back here to
 * stop them flip-flopping into the wrong language mid-utterance.
 */
export async function transcribeAudio(
  audio: Buffer,
  mimeType: string,
  languageHint?: string,
): Promise<TranscriptionResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set')
  }

  const extension = mimeType.includes('webm')
    ? 'webm'
    : mimeType.includes('mp4')
      ? 'mp4'
      : mimeType.includes('mpeg')
        ? 'mp3'
        : 'webm'

  const formData = new FormData()
  formData.append(
    'file',
    new Blob([Uint8Array.from(audio)], { type: mimeType }),
    `recording.${extension}`,
  )
  formData.append('model', MODEL)
  formData.append('response_format', 'verbose_json')
  if (languageHint) {
    formData.append('language', languageHint)
  }

  const response = await fetch(GROQ_TRANSCRIPTION_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Groq transcription failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as { text?: string; language?: string }
  return {
    transcript: (data.text ?? '').trim(),
    language: data.language ?? null,
  }
}
