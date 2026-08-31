import { ArrowDown } from 'lucide-react'
import type { LandingContent } from '@/content/landingContent'

export function LandingExamples({ content }: { content: LandingContent }) {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-sm font-medium text-text-muted">{content.examples.eyebrow}</p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {content.examples.title}
        </h2>
        <p className="mt-3 max-w-xl text-base text-text-muted">{content.examples.body}</p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.examples.items.map((example) => (
            <div key={example.transcript} className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-2xl rounded-bl-md bg-bg px-4 py-3 text-sm italic text-text">
                "{example.transcript}"
              </div>
              <ArrowDown size={16} className="text-text-muted" aria-hidden="true" />
              <div className="w-full rounded-2xl bg-bg p-4">
                <p
                  className={`text-lg font-semibold ${example.isIncome ? 'text-income' : 'text-expense'}`}
                >
                  {example.amount}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {example.category} · {example.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
