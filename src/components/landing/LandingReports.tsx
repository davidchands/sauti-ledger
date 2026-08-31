import type { LandingContent } from '@/content/landingContent'

export function LandingReports({ content }: { content: LandingContent }) {
  return (
    <section className="py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-8">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="w-full max-w-[300px] overflow-hidden rounded-[2.5rem] border border-border shadow-2xl">
            <img
              src="/landing/screen-ripoti.png"
              alt={content.reports.screenshotAlt}
              className="block w-full"
              width={780}
              height={1688}
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-sm font-medium text-text-muted">{content.reports.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {content.reports.title}
          </h2>
          <p className="mt-4 max-w-md text-base text-text-muted">{content.reports.body}</p>
        </div>
      </div>
    </section>
  )
}
