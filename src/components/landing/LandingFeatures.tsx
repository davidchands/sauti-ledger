import { Languages, PenLine, WifiOff, BarChart3, ShieldCheck, Smartphone } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

const ICONS = [Languages, PenLine, WifiOff, BarChart3, ShieldCheck, Smartphone]

export function LandingFeatures({ content }: { content: LandingContent }) {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium text-text-muted">{content.features.eyebrow}</p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {content.features.title}
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.features.items.map((feature, index) => {
            const Icon = ICONS[index]
            return (
              <div key={feature.title} className="rounded-2xl bg-surface p-6">
                <Icon size={20} className="text-text-muted" aria-hidden="true" />
                <p className="mt-4 text-base font-semibold text-text">{feature.title}</p>
                <p className="mt-1.5 text-sm text-text-muted">{feature.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
