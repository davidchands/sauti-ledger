import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  ariaLabel: string
  /** Mirror the tilt so a second phone elsewhere on the page doesn't look identical. */
  flip?: boolean
}

/**
 * A real 3D-styled device frame — CSS perspective, physical bezel, side
 * buttons, a Dynamic Island, and a subtle idle float — not a flat
 * screenshot rectangle. The screen renders live React content
 * (children), so language switching and motion inside it work exactly
 * like the real app (DESIGN.md § 24: "real product screenshots only,
 * never a fabricated mockup" — this renders the genuine component
 * tree, it just isn't a captured PNG).
 *
 * Sized to iPhone 17's real proportions — 402×874pt logical resolution
 * (6.3" display, 2622×1206px @460ppi) — via `aspect-[402/874]` on the
 * screen rather than a fixed pixel height, so it can never get
 * distorted by a parent applying its own width constraint (that's
 * exactly what made the hero's phone look thin originally: an outer
 * wrapper capped it narrower than this component's own width while the
 * screen height stayed fixed, skewing the ratio). Frame width and
 * bezel thickness are deliberately generous (380px, 10px border) so it
 * reads as a substantial real device rather than a small flat card,
 * not just correctly proportioned.
 */
export function PhoneMockup({ children, ariaLabel, flip }: PhoneMockupProps) {
  const reduceMotion = useReducedMotion()
  const restRotation = flip ? 8 : -8

  return (
    <div className="mx-auto w-full max-w-[380px] [perspective:1400px]" role="img" aria-label={ariaLabel}>
      <motion.div
        initial={{ opacity: 0, y: 28, rotateY: flip ? 18 : -18 }}
        whileInView={
          reduceMotion
            ? { opacity: 1, y: 0, rotateY: restRotation }
            : { opacity: 1, y: [0, -10, 0], rotateY: restRotation }
        }
        viewport={{ once: true, amount: 0.4 }}
        transition={
          reduceMotion
            ? { duration: 0.5 }
            : {
                opacity: { duration: 0.5 },
                rotateY: { duration: 0.5 },
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              }
        }
        style={{ transformStyle: 'preserve-3d' }}
        className="relative"
      >
        <div
          aria-hidden="true"
          className="absolute -inset-14 -z-10 rounded-[6rem] bg-[radial-gradient(closest-side,var(--landing-accent-soft),transparent)]"
        />

        <div className="relative rounded-[3.4rem] border-[10px] border-[#141221] bg-[#141221] p-2.5 shadow-[0_2px_0_rgba(255,255,255,0.08)_inset,0_55px_100px_-28px_rgba(20,18,31,0.6)]">
          <span
            aria-hidden="true"
            className="absolute -right-[11px] top-36 h-[72px] w-[9px] rounded-r-sm bg-[#141221]"
          />
          <span
            aria-hidden="true"
            className="absolute -left-[11px] top-28 h-10 w-[9px] rounded-l-sm bg-[#141221]"
          />
          <span
            aria-hidden="true"
            className="absolute -left-[11px] top-40 h-10 w-[9px] rounded-l-sm bg-[#141221]"
          />

          <div className="relative overflow-hidden rounded-[2.75rem] bg-bg">
            <div
              aria-hidden="true"
              className="absolute top-3 left-1/2 z-20 h-8 w-32 -translate-x-1/2 rounded-full bg-[#141221]"
            />

            <div className="relative aspect-[402/874] w-full overflow-hidden">{children}</div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.05)_100%)]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
