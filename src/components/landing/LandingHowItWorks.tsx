import { Mic, Loader2, ClipboardCheck, Check } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

const ICONS = [Mic, Loader2, ClipboardCheck, Check]

export function LandingHowItWorks({ content }: { content: LandingContent }) {
  return (
    <section id="how-it-works" className="bg-surface py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium text-text-muted">{content.howItWorks.eyebrow}</p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {content.howItWorks.title}
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.howItWorks.steps.map((step, index) => {
            const Icon = ICONS[index]
            return (
              <div key={step.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-text text-bg">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-semibold text-text">{step.title}</p>
                <p className="mt-1.5 text-sm text-text-muted">{step.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
