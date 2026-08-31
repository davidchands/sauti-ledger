import { Link } from 'react-router-dom'
import { Mic } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

export function LandingFinalCta({ content }: { content: LandingContent }) {
  return (
    <section className="py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {content.finalCta.title}
        </h2>
        <p className="mt-3 text-base text-text-muted">{content.finalCta.body}</p>
        <Link
          to="/miamala"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-text px-7 py-4 text-base font-semibold text-bg"
        >
          <Mic size={18} aria-hidden="true" />
          {content.finalCta.cta}
        </Link>
      </div>
    </section>
  )
}
