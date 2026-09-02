import { Languages, PenLine, WifiOff, BarChart3, ShieldCheck, Smartphone } from 'lucide-react'
import { motion } from 'motion/react'
import type { LandingContent } from '@/content/landingContent'

const ICONS = [Languages, PenLine, WifiOff, BarChart3, ShieldCheck, Smartphone]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

/**
 * Bento-style, not a uniform grid — the first feature (the single
 * biggest differentiator, bilingual voice) gets a wider, taller card;
 * the rest stay compact. Deliberately asymmetric so this section reads
 * differently from LandingHowItWorks' evenly-spaced timeline above it.
 */
export function LandingFeatures({ content }: { content: LandingContent }) {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-semibold text-[var(--landing-accent)]">
          {content.features.eyebrow}
        </p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {content.features.title}
        </h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {content.features.items.map((feature, index) => {
            const Icon = ICONS[index]
            const isHero = index === 0
            return (
              <motion.div
                key={feature.title}
                variants={card}
                className={`rounded-2xl border border-border bg-surface p-6 transition-shadow hover:border-[var(--landing-accent)]/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-16px_rgba(194,121,13,0.2)] ${
                  isHero ? 'sm:col-span-2 sm:row-span-2 sm:p-8' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full bg-[var(--landing-accent-soft)] text-[var(--landing-accent)] ${
                    isHero ? 'h-12 w-12' : 'h-9 w-9'
                  }`}
                >
                  <Icon size={isHero ? 22 : 18} aria-hidden="true" />
                </div>
                <p className={`mt-4 font-semibold text-text ${isHero ? 'text-xl' : 'text-base'}`}>
                  {feature.title}
                </p>
                <p className={`mt-1.5 text-text-muted ${isHero ? 'max-w-sm text-base' : 'text-sm'}`}>
                  {feature.body}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
