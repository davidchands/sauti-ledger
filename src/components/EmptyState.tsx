import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  hint?: string
  action?: ReactNode
}

/**
 * Every empty state must teach the user what to do next (DESIGN.md § 19).
 */
export function EmptyState({ message, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <p className="text-base text-text-muted">{message}</p>
      {hint && <p className="text-sm text-text-muted">{hint}</p>}
      {action}
    </div>
  )
}
