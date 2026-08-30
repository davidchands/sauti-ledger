interface LoadingIndicatorProps {
  message: string
}

/**
 * State-specific loading feedback, never a bare spinner or "Loading…"
 * (DESIGN.md § 20).
 */
export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-8" role="status">
      <span
        className="h-2 w-2 animate-pulse rounded-full bg-text-muted"
        aria-hidden="true"
      />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}
