import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderPhase = 'idle' | 'requesting' | 'recording' | 'reviewing' | 'error'

export type RecorderErrorReason = 'permission-denied' | 'no-microphone' | 'unsupported' | 'unknown'

const MAX_DURATION_MS = 60_000
const LEVEL_BAR_COUNT = 24
const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
]

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))
}

/**
 * Real microphone capture — permission, recording, live level metering,
 * cancel/retry, and a review/playback step. No transcription or upload:
 * that's Phase 6 (Groq) and Phase 7 (Gemini).
 */
export function useAudioRecorder() {
  const [phase, setPhase] = useState<RecorderPhase>('idle')
  const [error, setError] = useState<RecorderErrorReason | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  const [levels, setLevels] = useState<number[]>(() => Array(LEVEL_BAR_COUNT).fill(0))
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)

  const stopMetering = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const teardownStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
    analyserRef.current = null
  }, [])

  const startMetering = useCallback(() => {
    const sampleFrame = () => {
      const analyser = analyserRef.current
      if (!analyser) return

      const data = new Uint8Array(analyser.fftSize)
      analyser.getByteTimeDomainData(data)
      let sumSquares = 0
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128
        sumSquares += normalized * normalized
      }
      const rms = Math.sqrt(sumSquares / data.length)

      setLevels((prev) => [...prev.slice(1), Math.min(1, rms * 4)])
      setDurationMs(Date.now() - startedAtRef.current)

      if (Date.now() - startedAtRef.current >= MAX_DURATION_MS) {
        recorderRef.current?.stop()
        return
      }

      rafRef.current = requestAnimationFrame(sampleFrame)
    }

    rafRef.current = requestAnimationFrame(sampleFrame)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setPhase('requesting')

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('unsupported')
      setPhase('error')
      return
    }

    const mimeType = pickMimeType()
    if (!mimeType) {
      setError('unsupported')
      setPhase('error')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stopMetering()
        const blob = new Blob(chunksRef.current, { type: mimeType })
        teardownStream()
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setPhase((current) => (current === 'recording' ? 'reviewing' : current))
      }
      recorderRef.current = recorder

      recorder.start()
      startedAtRef.current = Date.now()
      setDurationMs(0)
      setLevels(Array(LEVEL_BAR_COUNT).fill(0))
      setPhase('recording')
      startMetering()
    } catch (err) {
      const name = err instanceof DOMException ? err.name : 'unknown'
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError('permission-denied')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError('no-microphone')
      } else {
        setError('unknown')
      }
      setPhase('error')
      teardownStream()
    }
  }, [startMetering, stopMetering, teardownStream])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }, [])

  const cancel = useCallback(() => {
    stopMetering()
    if (recorderRef.current?.state === 'recording') {
      // Discard — don't let onstop promote this into 'reviewing'.
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }
    teardownStream()
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setAudioBlob(null)
    setDurationMs(0)
    setPhase('idle')
  }, [stopMetering, teardownStream])

  const retry = useCallback(() => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setAudioBlob(null)
    setDurationMs(0)
    setPhase('idle')
  }, [])

  useEffect(() => {
    return () => {
      stopMetering()
      teardownStream()
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [stopMetering, teardownStream])

  return { phase, error, durationMs, levels, audioUrl, audioBlob, start, stop, cancel, retry }
}
