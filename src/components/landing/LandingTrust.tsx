import { ShieldCheck } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

/** A brand-color band, not a new accent — same inverted-contrast idea as before, now tinted with the landing accent instead of the app's neutral text color. */
export function LandingTrust({ content }: { content: LandingContent }) {
  return (
    <section className="bg-[var(--landing-accent)] py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <ShieldCheck size={28} className="text-white" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {content.trust.title}
        </h2>
        <p className="mt-4 text-base text-white/75">{content.trust.body}</p>
      </div>
    </section>
  )
}
