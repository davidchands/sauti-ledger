import type { LandingContent } from '@/content/landingContent'

export function LandingFooter({ content }: { content: LandingContent }) {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-semibold text-text">Sauti Ledger</p>
          <p className="text-sm text-text-muted">{content.footer.tagline}</p>
        </div>
        <a
          href="https://github.com/davidchands/sauti-ledger"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-text-muted hover:text-text"
        >
          {content.footer.sourceLink}
        </a>
      </div>
    </footer>
  )
}
