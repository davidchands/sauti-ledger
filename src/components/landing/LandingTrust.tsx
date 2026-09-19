import { ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import type { LandingContent } from '@/content/landingContent'

/** A brand-color band, not a new accent — same inverted-contrast idea as before, now tinted with the landing accent instead of the app's neutral text color. */
export function LandingTrust({ content }: { content: LandingContent }) {
  return (
    <section className="bg-[var(--landing-accent)] py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center"
      >
        <ShieldCheck size={28} className="text-white" aria-hidden="true" />
        <h2 className="landing-display mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {content.trust.title}
        </h2>
        <p className="mt-4 text-base text-white/75">{content.trust.body}</p>
      </motion.div>
    </section>
  )
}
