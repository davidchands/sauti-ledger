import { useEffect, useState } from 'react'
import {
  Languages,
  PenLine,
  WifiOff,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Mic,
  Send,
  Check,
  Lock,
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import type { LandingContent } from '@/content/landingContent'
import type { Language } from '@/i18n/translations'
import { useLanguage } from '@/i18n/useLanguage'

const ICONS = [Languages, PenLine, WifiOff, BarChart3, ShieldCheck, Smartphone]
const AUTOPLAY_MS = 5000

/**
 * A tabbed, auto-advancing feature selector (Calendly/Gumloop's pattern)
 * instead of a static grid of icon cards — a vertical list of feature
 * names on one side, each with a progress bar that fills and advances
 * to the next; a visual panel on the other side crossfades to match.
 * Hovering or clicking pauses/jumps the autoplay. Each panel is a small
 * illustrative mockup distinct to that feature, not a repeated
 * icon+title+body block.
 */
export function LandingFeatures({ content }: { content: LandingContent }) {
  const reduceMotion = useReducedMotion()
  const items = content.features.items
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion || paused) return
    const start = Date.now()
    let frame: number
    const tick = () => {
      const pct = Math.min(100, ((Date.now() - start) / AUTOPLAY_MS) * 100)
      setProgress(pct)
      if (pct >= 100) {
        setActive((i) => (i + 1) % items.length)
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, paused, reduceMotion, items.length])

  const select = (i: number) => {
    setActive(i)
    setProgress(0)
  }

  return (
    <section id="features" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-semibold text-[var(--landing-accent)]">
          {content.features.eyebrow}
        </p>
        <h2 className="landing-display mt-2 max-w-xl text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          {content.features.title}
        </h2>

        <div
          className="mt-12 grid gap-8 lg:grid-cols-[360px_1fr] lg:items-center lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="order-2 flex flex-col gap-0.5 lg:order-1">
            {items.map((feature, i) => {
              const Icon = ICONS[i]
              const isActive = i === active
              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={isActive}
                  className={`rounded-xl px-4 py-3 text-left transition-colors ${
                    isActive ? 'bg-surface' : 'hover:bg-surface/60'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isActive ? 'text-[var(--landing-accent)]' : 'text-text-muted'}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-sm font-semibold ${isActive ? 'text-text' : 'text-text-muted'}`}
                    >
                      {feature.title}
                    </span>
                  </span>
                  {isActive && (
                    <p className="mt-1.5 pl-[28px] text-sm text-text-muted">{feature.body}</p>
                  )}
                  <span className="mt-2.5 ml-[28px] block h-[2px] overflow-hidden rounded-full bg-border">
                    {isActive && (
                      <span
                        className="block h-full bg-[var(--landing-accent)]"
                        style={{
                          width: `${reduceMotion ? 100 : progress}%`,
                          transition: reduceMotion ? undefined : 'width 60ms linear',
                        }}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-surface lg:order-2">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-8 sm:p-10"
              >
                <FeatureVisual index={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureVisual({ index }: { index: number }) {
  const { language } = useLanguage()
  switch (index) {
    case 0:
      return <BilingualVisual language={language} />
    case 1:
      return <ManualEntryVisual language={language} />
    case 2:
      return <OfflineVisual language={language} />
    case 3:
      return <ReportsVisual />
    case 4:
      return <OwnershipVisual language={language} />
    default:
      return <InstallVisual language={language} />
  }
}

function TranscriptBubble({ lang, text }: { lang: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-bg px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]">
        <Mic size={13} aria-hidden="true" />
      </span>
      <p className="text-sm text-text">"{text}"</p>
      <span className="ml-auto shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
        {lang}
      </span>
    </div>
  )
}

function BilingualVisual({ language }: { language: Language }) {
  const pairs =
    language === 'sw'
      ? [
          { lang: 'SW', text: 'Nimeuza mchele elfu ishirini' },
          { lang: 'EN', text: 'Bought fuel for five thousand' },
        ]
      : [
          { lang: 'EN', text: 'Sold rice for twenty thousand' },
          { lang: 'SW', text: 'Nimenunua mafuta elfu tano' },
        ]
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      {pairs.map((p) => (
        <TranscriptBubble key={p.text} lang={p.lang} text={p.text} />
      ))}
    </div>
  )
}

function ManualEntryVisual({ language }: { language: Language }) {
  const example = language === 'sw' ? 'Nimeuza sukari 5000' : 'Sold sugar for 5000'
  const placeholder = language === 'sw' ? 'Andika kilichotokea…' : 'Type what happened…'
  return (
    <div className="w-full max-w-xs rounded-2xl border border-border bg-bg p-4">
      <p className="text-xs text-text-muted">{placeholder}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-full border border-border bg-surface px-3.5 py-2.5 text-sm text-text">
          {example}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--landing-accent)] text-white">
          <Send size={14} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function OfflineVisual({ language }: { language: Language }) {
  const saved = language === 'sw' ? 'Imehifadhiwa kwenye simu' : 'Saved on your phone'
  const synced = language === 'sw' ? 'Imesawazishwa' : 'Synced'
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]">
        <WifiOff size={24} aria-hidden="true" />
      </span>
      <span className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text-muted">
        {saved}
      </span>
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <span className="flex items-center gap-1.5 rounded-full bg-income-bg px-3 py-1.5 text-xs font-semibold text-income">
        <Check size={12} aria-hidden="true" />
        {synced}
      </span>
    </div>
  )
}

function ReportsVisual() {
  const { t } = useLanguage()
  return (
    <div className="flex h-24 w-full max-w-[180px] items-end justify-center gap-4">
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="h-full w-full rounded-t-md bg-income" style={{ height: '100%' }} />
        <span className="text-[10px] text-text-muted">{t('ripoti.income')}</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="h-full w-full self-end rounded-t-md bg-expense" style={{ height: '35%' }} />
        <span className="text-[10px] text-text-muted">{t('ripoti.expense')}</span>
      </div>
    </div>
  )
}

function OwnershipVisual({ language }: { language: Language }) {
  const label = language === 'sw' ? 'Kifaa chako pekee' : 'Only on your device'
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]">
        <ShieldCheck size={28} aria-hidden="true" />
      </span>
      <span className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text-muted">
        <Lock size={11} aria-hidden="true" />
        {label}
      </span>
    </div>
  )
}

function InstallVisual({ language }: { language: Language }) {
  const label = language === 'sw' ? 'Skrini ya Nyumbani' : 'Home Screen'
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-9 w-9 rounded-xl bg-border/60" aria-hidden="true" />
        ))}
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--landing-accent)] text-white shadow-[0_6px_16px_-4px_rgba(194,121,13,0.5)]">
          <Mic size={15} aria-hidden="true" />
        </span>
      </div>
      <span className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text-muted">
        {label}
      </span>
    </div>
  )
}
