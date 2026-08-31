import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Mic } from 'lucide-react'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import type { LandingContent } from '@/content/landingContent'

type Step = 'idle' | 'listening' | 'processing' | 'result' | 'updated' | 'hold'

const DURATIONS: Record<Step, number> = {
  idle: 700,
  listening: 1900,
  processing: 900,
  result: 1300,
  updated: 1100,
  hold: 2400,
}

const SEQUENCE: Step[] = ['idle', 'listening', 'processing', 'result', 'updated', 'hold']

/** Animates a number counting from one integer to another while `active`. */
function useCountUp(from: number, to: number, active: boolean, reduceMotion: boolean) {
  const [animatedValue, setAnimatedValue] = useState(from)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!active || reduceMotion) return
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) * (1 - progress)
      setAnimatedValue(Math.round(from + (to - from) * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [active, reduceMotion, from, to])

  if (!active) return from
  if (reduceMotion) return to
  return animatedValue
}

/**
 * The living voice → transaction → balance sequence shown inside the
 * hero phone (the product's core value made visible, not described).
 * Cycles automatically; every string comes from the same i18n system as
 * the rest of the app, so switching language mid-sequence updates it
 * immediately with no separate hard-coded screenshots per language.
 */
export function PhoneVoiceDemo({ content }: { content: LandingContent }) {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion() ?? false
  const [stepIndex, setStepIndex] = useState(0)
  const step = SEQUENCE[stepIndex]
  const { transcript, category, description, amount, isIncome, balanceBefore, balanceAfter } =
    content.heroDemo

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStepIndex((index) => (index + 1) % SEQUENCE.length)
    }, DURATIONS[step])
    return () => clearTimeout(timeout)
  }, [step])

  const showTransaction = step === 'result' || step === 'updated' || step === 'hold'
  const balanceActive = step === 'updated' || step === 'hold'
  const balance = useCountUp(balanceBefore, balanceAfter, balanceActive, reduceMotion)
  const isListening = step === 'listening'
  const isBusy = step === 'listening' || step === 'processing'

  const visibleChars = useTypewriter(transcript, isListening, reduceMotion)

  return (
    <div className="flex h-full flex-col bg-bg px-5 pt-11 pb-6">
      <p className="text-center text-[11px] font-medium text-text-muted">{t('balance.label')}</p>
      <p className="mt-0.5 text-center text-2xl font-bold tabular-nums text-text">
        {formatTSh(balance)}
      </p>

      <div className="mt-5 flex items-center justify-between text-xs font-medium text-text-muted">
        <span>{t('today.label')}</span>
      </div>

      <div className="mt-2 flex-1">
        <AnimatePresence>
          {showTransaction && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="rounded-2xl border border-border bg-surface p-3.5"
            >
              <div className="flex items-center justify-between">
                <p
                  className={`text-lg font-bold tabular-nums ${isIncome ? 'text-income' : 'text-expense'}`}
                >
                  {isIncome ? '+' : '−'} {formatTSh(amount)}
                </p>
                {step !== 'result' && (
                  <span className="rounded-full bg-income-bg px-2 py-0.5 text-[10px] font-semibold text-income">
                    {t('mic.success')}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                {t(`category.${category}`)} · {description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex flex-col items-center gap-2.5">
        <div className="min-h-[2.5rem] w-full rounded-xl bg-surface px-3 py-2 text-center text-xs text-text-muted">
          {isBusy ? (
            <span className="italic text-text">"{visibleChars}"</span>
          ) : (
            <span className="opacity-0">.</span>
          )}
        </div>

        <div className="relative flex h-14 w-14 items-center justify-center">
          {isListening && !reduceMotion && (
            <>
              <span
                aria-hidden="true"
                className="absolute -inset-3 -z-10 rounded-full blur-md"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent, var(--color-expense) 25%, transparent 55%)',
                  animation: 'mic-beam-rotate 2.2s linear infinite',
                }}
              />
              {[0, 0.6].map((delay) => (
                <span
                  key={delay}
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full border-2 border-expense"
                  style={{ animation: `mic-pulse-ring 1.8s ease-out ${delay}s infinite` }}
                />
              ))}
            </>
          )}
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
              isListening ? 'bg-expense text-white' : 'bg-text text-bg'
            }`}
          >
            <Mic size={22} aria-hidden="true" />
          </span>
        </div>
        <p className="text-[11px] font-medium text-text-muted">
          {isListening
            ? t('mic.recording')
            : step === 'processing'
              ? t('recorder.transcribing')
              : t('mic.idle')}
        </p>
      </div>
    </div>
  )
}

/** Reveals `text` a few characters at a time while `active`; shows the full string otherwise or under reduced motion. */
function useTypewriter(text: string, active: boolean, reduceMotion: boolean): string {
  const [revealCount, setRevealCount] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!active || reduceMotion) return
    const start = performance.now()
    const totalMs = DURATIONS.listening - 200
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / totalMs)
      setRevealCount(Math.round(progress * text.length))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [active, reduceMotion, text])

  if (!active || reduceMotion) return text
  return text.slice(0, revealCount)
}
