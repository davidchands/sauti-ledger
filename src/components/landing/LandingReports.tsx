import { motion } from 'motion/react'
import { PhoneMockup } from '@/components/landing/PhoneMockup'
import { PhoneReportsDemo } from '@/components/landing/PhoneReportsDemo'
import { REPORTS_DEMO_DATA } from '@/components/landing/reportsDemoData'
import { formatTSh } from '@/lib/currency'
import { useLanguage } from '@/i18n/useLanguage'
import type { LandingContent } from '@/content/landingContent'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const row = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

export function LandingReports({ content }: { content: LandingContent }) {
  const { t } = useLanguage()
  const [balanceQuestion, leakQuestion] = content.reports.questions

  return (
    <section className="py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-8">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <PhoneMockup ariaLabel={content.reports.screenshotAlt} flip>
            <PhoneReportsDemo />
          </PhoneMockup>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={container}
          className="order-1 lg:order-2"
        >
          <motion.div variants={row}>
            <p className="text-sm font-semibold text-[var(--landing-accent)]">
              {content.reports.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {content.reports.title}
            </h2>
            <p className="mt-4 max-w-md text-base text-text-muted">{content.reports.body}</p>
          </motion.div>

          {/* The exact questions from DESIGN.md § 18, answered with the same numbers the phone renders — proof, not another paragraph of copy. */}
          <div className="mt-8 max-w-md divide-y divide-border border-t border-border">
            <motion.div variants={row} className="flex items-center justify-between gap-4 py-4">
              <p className="text-sm text-text-muted">{balanceQuestion}</p>
              <p className="text-xl font-bold tabular-nums text-text">
                {formatTSh(REPORTS_DEMO_DATA.balance)}
              </p>
            </motion.div>
            <motion.div variants={row} className="flex items-center justify-between gap-4 py-4">
              <p className="text-sm text-text-muted">{leakQuestion}</p>
              <p className="text-right text-xl font-bold tabular-nums text-expense">
                {t(`category.${REPORTS_DEMO_DATA.leakCategory}`)}{' '}
                <span className="text-text-muted">({formatTSh(REPORTS_DEMO_DATA.leakAmount)})</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
