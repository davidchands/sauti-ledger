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
 * buttons, a notch, and a subtle idle float — not a flat screenshot
 * rectangle. The screen renders live React content (children), so
 * language switching and motion inside it work exactly like the real
 * app (DESIGN.md § 24: "real product screenshots only, never a
 * fabricated mockup" — this renders the genuine component tree, it just
 * isn't a captured PNG).
 */
export function PhoneMockup({ children, ariaLabel, flip }: PhoneMockupProps) {
  const reduceMotion = useReducedMotion()
  const restRotation = flip ? 8 : -8

  return (
    <div className="mx-auto w-full max-w-[300px] [perspective:1400px]" role="img" aria-label={ariaLabel}>
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
          className="absolute -inset-10 -z-10 rounded-[4rem] bg-[radial-gradient(closest-side,var(--landing-accent-soft),transparent)]"
        />

        <div className="relative rounded-[2.75rem] border-[6px] border-[#141221] bg-[#141221] p-1.5 shadow-[0_2px_0_rgba(255,255,255,0.08)_inset,0_50px_90px_-28px_rgba(20,18,31,0.55)]">
          <span
            aria-hidden="true"
            className="absolute -right-[7px] top-28 h-14 w-[6px] rounded-r-sm bg-[#141221]"
          />
          <span
            aria-hidden="true"
            className="absolute -left-[7px] top-20 h-8 w-[6px] rounded-l-sm bg-[#141221]"
          />
          <span
            aria-hidden="true"
            className="absolute -left-[7px] top-32 h-8 w-[6px] rounded-l-sm bg-[#141221]"
          />

          <div className="relative overflow-hidden rounded-[2.25rem] bg-bg">
            <div
              aria-hidden="true"
              className="absolute top-2 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#141221]"
            />

            <div className="relative h-[560px] w-full overflow-hidden">{children}</div>

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
