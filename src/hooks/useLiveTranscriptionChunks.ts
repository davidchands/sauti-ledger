import { useEffect, useRef, useState } from 'react'
import { pickMimeType } from '@/lib/audioMimeType'
import { transcribeAudio } from '@/services/transcriptionService'
import { normalizeLanguage } from '@/lib/language'

// Short enough that captions feel live, long enough that Groq gets a
// usable amount of speech per chunk instead of mostly silence/onset noise.
// Kept well under a typical short utterance so the FIRST chunk usually
// resolves before release, not after.
const CHUNK_MS = 1400

/**
 * On-screen live captions while the mic is held, built for screen
 * recordings/promo videos — reuses the SAME Groq Whisper pipeline that
 * transcribes the real, saved recording (AGENTS.md § 5), just called
 * repeatedly on short slices of the live stream instead of once at the
 * end. This is why it's noticeably more accurate on Swahili/mixed
 * speech than the browser's built-in SpeechRecognition.
 *
 * Chunks are recorded and transcribed strictly one at a time (record ->
 * await the transcript -> record the next) so captions always append in
 * spoken order; there's a few-hundred-ms gap around each chunk boundary
 * while the previous one is in flight, not a hard real-time transcript.
 * The FULL recording is still sent through the normal pipeline on
 * release — this hook only feeds the caption bubble, never extraction.
 */
export function useLiveTranscriptionChunks(stream: MediaStream | null) {
  const [caption, setCaption] = useState('')
  const activeRef = useRef(false)

  useEffect(() => {
    if (!stream) return

    const mimeType = pickMimeType()
    if (!mimeType) return

    activeRef.current = true
    let isFirstChunk = true
    // Whisper auto-detects language per request, and a ~1.4s chunk is
    // often too little audio to detect reliably on its own — without
    // this, later chunks of the same utterance can flip-flop into the
    // wrong language mid-caption. Locking to whatever the first chunk
    // detects keeps the rest of the recording consistent.
    let detectedLanguage: 'sw' | 'en' | undefined

    const recordChunk = () => {
      if (!activeRef.current) return

      const chunks: Blob[] = []
      let recorder: MediaRecorder
      try {
        recorder = new MediaRecorder(stream, { mimeType })
      } catch {
        return
      }

      // Clears any leftover caption from a previous recording exactly
      // when the new one actually starts capturing — deferred to the
      // (async) onstart event rather than called at the top of the
      // effect, per react-hooks/set-state-in-effect.
      if (isFirstChunk) {
        isFirstChunk = false
        recorder.onstart = () => setCaption('')
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType })
        if (blob.size > 0) {
          try {
            const result = await transcribeAudio(blob, detectedLanguage)
            if (!detectedLanguage) {
              detectedLanguage = normalizeLanguage(result.language)
            }
            // Applied even if recording already stopped — for a short
            // utterance, the mic is often released before this chunk's
            // transcript comes back, and that's exactly the caption the
            // user most needs to see (setState on an already-unmounted
            // *display* is harmless; this hook itself stays mounted).
            if (result.transcript) {
              setCaption((prev) => `${prev} ${result.transcript}`.trim())
            }
          } catch {
            // Cosmetic — a dropped chunk just means a short gap in the
            // caption, never surfaced as an error.
          }
        }
        if (activeRef.current) recordChunk()
      }

      recorder.start()
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, CHUNK_MS)
    }

    recordChunk()

    return () => {
      activeRef.current = false
    }
  }, [stream])

  return { caption }
}
