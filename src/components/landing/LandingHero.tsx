import { Link } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { PhoneMockup } from '@/components/landing/PhoneMockup'
import { PhoneVoiceDemo } from '@/components/landing/PhoneVoiceDemo'
import type { LandingContent } from '@/content/landingContent'

/**
 * Highlights one keyword in the accent color, the way the inspiration
 * references highlight their one key phrase — matched by exact
 * substring so translators keep full control of word order in both
 * languages instead of markup baked into landingContent.ts.
 */
function Headline({ text, highlight }: { text: string; highlight: string }) {
  const index = text.indexOf(highlight)
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <span className="text-[var(--landing-accent)]">{highlight}</span>
      {text.slice(index + highlight.length)}
    </>
  )
}

const HIGHLIGHT: Record<string, string> = {
  'Endesha biashara yako kwa kuongea.': 'kuongea',
  'Run your business by speaking.': 'speaking',
}

export function LandingHero({ content }: { content: LandingContent }) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="landing-dot-grid relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--landing-accent-soft)_0%,transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-10 pb-24 lg:grid-cols-2 lg:gap-8 lg:pt-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--landing-accent)]"
              aria-hidden="true"
            />
            {content.hero.badge}
          </span>

          <h1 className="mt-6 text-6xl font-bold tracking-tight text-text sm:text-7xl lg:text-6xl xl:text-7xl">
            <Headline text={content.hero.headline} highlight={HIGHLIGHT[content.hero.headline] ?? ''} />
          </h1>

          <p className="mt-6 max-w-lg text-lg text-text-muted sm:text-xl">
            {content.hero.subheadline}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/miamala"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-accent)] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_28px_-8px_rgba(91,79,233,0.55)] transition-transform hover:scale-[1.02]"
            >
              <Mic size={18} aria-hidden="true" />
              {content.hero.ctaPrimary}
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3.5 text-base font-medium text-text transition-colors hover:border-[var(--landing-accent)]"
            >
              {content.hero.ctaSecondary}
            </a>
          </div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <PhoneMockup ariaLabel={content.hero.demoAriaLabel}>
            <PhoneVoiceDemo content={content} />
          </PhoneMockup>
        </div>
      </div>
    </section>
  )
}
