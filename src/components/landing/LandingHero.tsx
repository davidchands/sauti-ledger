import { Link } from 'react-router-dom'
import { Mic } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

export function LandingHero({ content }: { content: LandingContent }) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-8 pb-20 lg:grid-cols-2 lg:gap-8 lg:pt-16">
      <div>
        <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted">
          {content.hero.badge}
        </span>

        <h1 className="mt-6 text-5xl font-bold tracking-tight text-text sm:text-6xl lg:text-6xl">
          {content.hero.headline}
        </h1>

        <p className="mt-6 max-w-lg text-lg text-text-muted">{content.hero.subheadline}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/miamala"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-text px-6 py-3.5 text-base font-semibold text-bg"
          >
            <Mic size={18} aria-hidden="true" />
            {content.hero.ctaPrimary}
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3.5 text-base font-medium text-text"
          >
            {content.hero.ctaSecondary}
          </a>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <div className="w-full max-w-[300px] overflow-hidden rounded-[2.5rem] border border-border shadow-2xl">
          <img
            src="/landing/screen-miamala.png"
            alt={content.hero.screenshotAlt}
            className="block w-full"
            width={780}
            height={1688}
          />
        </div>
      </div>
    </section>
  )
}
