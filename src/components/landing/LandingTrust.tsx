import { ShieldCheck } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

/** Polarity-flipped dark band — same principle as Wise's hero-band-dark: a brand moment via surface contrast, not a new accent color. */
export function LandingTrust({ content }: { content: LandingContent }) {
  return (
    <section className="bg-text py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <ShieldCheck size={28} className="text-bg" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-bg sm:text-4xl">
          {content.trust.title}
        </h2>
        <p className="mt-4 text-base text-bg/70">{content.trust.body}</p>
      </div>
    </section>
  )
}
