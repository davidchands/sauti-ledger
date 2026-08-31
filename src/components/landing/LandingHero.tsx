import { Link } from 'react-router-dom'
import { Mic } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

export function LandingHero({ content }: { content: LandingContent }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-income-bg)_0%,transparent_70%)] opacity-70"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-10 pb-24 lg:grid-cols-2 lg:gap-8 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-income" aria-hidden="true" />
            {content.hero.badge}
          </span>

          <h1 className="mt-6 text-6xl font-bold tracking-tight text-text sm:text-7xl lg:text-6xl xl:text-7xl">
            {content.hero.headline}
          </h1>

          <p className="mt-6 max-w-lg text-lg text-text-muted sm:text-xl">
            {content.hero.subheadline}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/miamala"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-text px-6 py-3.5 text-base font-semibold text-bg shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.02]"
            >
              <Mic size={18} aria-hidden="true" />
              {content.hero.ctaPrimary}
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3.5 text-base font-medium text-text transition-colors hover:border-text/40"
            >
              {content.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[300px]">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,var(--color-income-bg),transparent)] opacity-80"
            />
            <div className="overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.06),0_40px_80px_-24px_rgba(0,0,0,0.28)]">
              <img
                src="/landing/screen-miamala.png"
                alt={content.hero.screenshotAlt}
                className="block w-full"
                width={780}
                height={1688}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
