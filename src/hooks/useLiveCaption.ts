import { useCallback, useRef, useState } from 'react'

/**
 * lib.dom.d.ts ships the SpeechRecognition *event* types but not the
 * SpeechRecognition class itself (and `webkitSpeechRecognition` isn't in
 * the DOM lib at all) — this is the minimal shape this hook needs.
 */
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * Best-effort ON-SCREEN captions while the mic is held — purely
 * cosmetic, for screen recordings. The real pipeline that decides what
 * gets saved is still Groq Whisper -> Gemini (AGENTS.md § 5); this hook
 * never touches extraction or the saved transaction, so a wrong or
 * missing caption can't corrupt a transaction. Uses the browser's
 * built-in SpeechRecognition where available; where it isn't (Firefox,
 * most non-Chromium browsers), `isSupported` is false and the caller
 * just shows no caption — the mic still records and saves normally.
 */
export function useLiveCaption(lang: string) {
  const [caption, setCaption] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const isSupported = getSpeechRecognitionCtor() !== null

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    setCaption('')
    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) finalText += text
        else interimText += text
      }
      setCaption(`${finalText} ${interimText}`.trim())
    }
    // Captions are cosmetic — a mic-access race, a silent gap, or an
    // unsupported locale should never surface as a user-facing error.
    recognition.onerror = () => {}

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // Throws if start() is called on an already-started instance —
      // harmless here since we always construct a fresh instance.
    }
  }, [lang])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }, [])

  return { caption, isSupported, start, stop }
}
