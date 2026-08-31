import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { LandingContent } from '@/content/landingContent'

export function LandingNav({ content }: { content: LandingContent }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <span className="text-lg font-semibold tracking-tight text-text">Sauti Ledger</span>

      <nav className="hidden items-center gap-8 md:flex">
        <a href="#how-it-works" className="text-sm font-medium text-text-muted hover:text-text">
          {content.nav.howItWorks}
        </a>
        <a href="#features" className="text-sm font-medium text-text-muted hover:text-text">
          {content.nav.features}
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Link
          to="/miamala"
          className="rounded-full bg-text px-4 py-2 text-sm font-semibold text-bg"
        >
          {content.nav.cta}
        </Link>
      </div>
    </header>
  )
}
