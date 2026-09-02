import { useEffect, useState } from 'react'
import { Mic } from 'lucide-react'
import type { LandingContent, LandingExample } from '@/content/landingContent'
import { useLanguage } from '@/i18n/useLanguage'

type Stage = 'transcribing' | 'extracting' | 'result'

const STAGE_DURATIONS: Record<Stage, number> = {
  transcribing: 900,
  extracting: 700,
  result: 3200,
}

/**
 * A real, restrained "live demo" — cycles through the same verified
 * examples used elsewhere (AI_SPEC.md § 6 / eval/dataset.ts), replaying
 * the actual transcribe → extract → auto-save flow shape (no
 * confirm-before-save step — DESIGN.md § 15) so a visitor can see the
 * product work without us fabricating output for arbitrary input.
 */
export function LandingExamples({ content }: { content: LandingContent }) {
  const { t } = useLanguage()
  const items = content.examples.items
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<Stage>('transcribing')

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (stage === 'transcribing') setStage('extracting')
      else if (stage === 'extracting') setStage('result')
      else {
        setStage('transcribing')
        setIndex((i) => (i + 1) % items.length)
      }
    }, STAGE_DURATIONS[stage])
    return () => clearTimeout(timeout)
  }, [stage, items.length])

  const active = items[index]

  const selectExample = (i: number) => {
    setIndex(i)
    setStage('transcribing')
  }

  return (
    <section id="demo" className="bg-surface py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold text-[var(--landing-accent)]">
            {content.examples.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {content.examples.title}
          </h2>
          <p className="mt-3 text-base text-text-muted">{content.examples.body}</p>
        </div>

        <div className="mx-auto mt-12 max-w-lg">
          <DemoCard example={active} stage={stage} t={t} />

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.transcript}
                type="button"
                onClick={() => selectExample(i)}
                aria-pressed={i === index}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === index
                    ? 'border-[var(--landing-accent)] bg-[var(--landing-accent)] text-white'
                    : 'border-border text-text-muted hover:border-[var(--landing-accent)]/40 hover:text-text'
                }`}
              >
                {item.description}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DemoCard({
  example,
  stage,
  t,
}: {
  example: LandingExample
  stage: Stage
  t: (path: import('@/i18n/translations').TranslationPath) => string
}) {
  return (
    <div className="rounded-3xl border border-border bg-bg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.12)] sm:p-8">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            stage === 'transcribing'
              ? 'bg-[var(--landing-accent)] text-white'
              : 'bg-surface text-text-muted'
          }`}
        >
          <Mic size={16} aria-hidden="true" />
        </span>
        <p className="pt-1.5 text-lg italic leading-snug text-text sm:text-xl">
          "{example.transcript}"
        </p>
      </div>

      <div className="mt-6 min-h-[92px] border-t border-border pt-6">
        {(stage === 'transcribing' || stage === 'extracting') && (
          <StatusRow label={t('recorder.transcribing')} />
        )}
        {stage === 'result' && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  example.isIncome ? 'text-income' : 'text-expense'
                }`}
              >
                {example.amount}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {example.category} · {example.description}
              </p>
            </div>
            <span className="rounded-full bg-income-bg px-3 py-1 text-xs font-semibold text-income">
              {t('mic.success')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium text-text-muted">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
      </span>
      {label}
    </div>
  )
}
