import { useCallback, useEffect, useRef, useState } from 'react'
import { pickMimeType } from '@/lib/audioMimeType'

export type RecorderPhase = 'idle' | 'requesting' | 'recording' | 'error'

export type RecorderErrorReason = 'permission-denied' | 'no-microphone' | 'unsupported' | 'unknown'

const MAX_DURATION_MS = 60_000
// Below this, treat it as an accidental tap/bump, not a real recording —
// discard silently instead of sending a near-empty clip to Groq.
const MIN_DURATION_MS = 400
const LEVEL_BAR_COUNT = 24

/**
 * Real microphone capture — press-and-hold, not tap-to-toggle. Permission,
 * live level metering, and a completed-recording callback; no manual
 * review/playback step — the caller chains straight into transcription
 * on release, per the "remove the friction of confirming the recording"
 * product decision.
 */
export function useAudioRecorder(onRecorded: (blob: Blob) => void) {
  const [phase, setPhase] = useState<RecorderPhase>('idle')
  const [error, setError] = useState<RecorderErrorReason | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  const [levels, setLevels] = useState<number[]>(() => Array(LEVEL_BAR_COUNT).fill(0))

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)
  const onRecordedRef = useRef(onRecorded)
  useEffect(() => {
    onRecordedRef.current = onRecorded
  }, [onRecorded])

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
    // Already recording/requesting — a repeated key-repeat or double
    // pointerdown must not restart the pipeline mid-capture.
    if (recorderRef.current?.state === 'recording') return

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
        const elapsed = Date.now() - startedAtRef.current
        const blob = new Blob(chunksRef.current, { type: mimeType })
        teardownStream()
        setPhase((current) => (current === 'recording' ? 'idle' : current))
        if (elapsed >= MIN_DURATION_MS) {
          onRecordedRef.current(blob)
        }
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
      // Discard — don't let onstop fire onRecorded for this take.
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }
    teardownStream()
    setDurationMs(0)
    setPhase('idle')
  }, [stopMetering, teardownStream])

  const reset = useCallback(() => setPhase('idle'), [])

  useEffect(() => {
    return () => {
      stopMetering()
      teardownStream()
    }
  }, [stopMetering, teardownStream])

  return { phase, error, durationMs, levels, start, stop, cancel, reset }
}
