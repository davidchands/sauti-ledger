import { Mic, Loader2, Check } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { LandingContent } from '@/content/landingContent'

const ICONS = [Mic, Loader2, Check]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.22, delayChildren: 0.1 } },
}

const step = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

/**
 * A connected timeline, not a card grid — deliberately structured
 * differently from LandingFeatures below it (no borders, no equal-size
 * boxes) so the two eyebrow+title sections back-to-back don't read as
 * the same template repeated. The line draws in as the visitor scrolls,
 * and each step follows it in sequence rather than appearing at once.
 */
export function LandingHowItWorks({ content }: { content: LandingContent }) {
  const reduceMotion = useReducedMotion()

  return (
    <section id="how-it-works" className="bg-surface py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-semibold text-[var(--landing-accent)]">
          {content.howItWorks.eyebrow}
        </p>
        <h2 className="landing-display mt-2 max-w-xl text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          {content.howItWorks.title}
        </h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={container}
          className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6"
        >
          <motion.div
            aria-hidden="true"
            initial={reduceMotion ? undefined : { scaleX: 0 }}
            whileInView={reduceMotion ? undefined : { scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
            className="absolute top-6 right-[16.5%] left-[16.5%] hidden h-px bg-[var(--landing-accent)]/25 sm:block"
          />
          {content.howItWorks.steps.map((item, index) => {
            const Icon = ICONS[index]
            return (
              <motion.div key={item.title} variants={step} className="relative">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--landing-accent)] text-white shadow-[0_8px_20px_-6px_rgba(194,121,13,0.45)]">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-semibold text-text">{item.title}</p>
                <p className="mt-1.5 text-sm text-text-muted">{item.body}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
