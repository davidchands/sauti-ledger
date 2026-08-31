import { useLanguage } from '@/i18n/useLanguage'
import { getLandingContent } from '@/content/landingContent'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingExamples } from '@/components/landing/LandingExamples'
import { LandingReports } from '@/components/landing/LandingReports'
import { LandingTrust } from '@/components/landing/LandingTrust'
import { LandingFinalCta } from '@/components/landing/LandingFinalCta'
import { LandingFooter } from '@/components/landing/LandingFooter'

/**
 * Marketing surface — separate from AppShell (no bottom nav / 430px cap).
 * Full-width responsive by design; the in-product experience stays
 * mobile-first per DESIGN.md, but a landing page is read on any device.
 */
export function LandingPage() {
  const { language } = useLanguage()
  const content = getLandingContent(language)

  return (
    <div className="landing-page min-h-dvh bg-bg text-text">
      <LandingNav content={content} />
      <LandingHero content={content} />
      <LandingHowItWorks content={content} />
      <LandingFeatures content={content} />
      <LandingExamples content={content} />
      <LandingReports content={content} />
      <LandingTrust content={content} />
      <LandingFinalCta content={content} />
      <LandingFooter content={content} />
    </div>
  )
}
